import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useBasketStore } from '../store/basketStore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with test public key
const stripePromise = loadStripe('pk_test_51O...'); // Replace with your test public key

// Mock payment intent data for testing
const MOCK_PAYMENT_INTENT = {
  id: 'pi_mock_' + Math.random().toString(36).substr(2, 9),
  client_secret: 'pi_mock_secret_' + Math.random().toString(36).substr(2),
  amount: 1000, // £10.00
  currency: 'gbp',
  status: 'requires_payment_method',
};

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethodType, setPaymentMethodType] = useState<string | null>(null);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  const navigate = useNavigate();
  const { items, totalPrice, clearBasket, removeItem } = useBasketStore();

  // Handle payment element ready state
  const handleReady = () => {
    setIsPaymentElementReady(true);
  };

  // Handle payment element change events
  const handleChange = (event: any) => {
    setPaymentMethodType(event.value.type);
  };

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      postal_code: '',
      country: 'GB',
    },
    phone: '',
  });

  const handleChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
          receipt_email: formData.email,
          payment_method_data: {
            billing_details: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.address.line1,
                line2: formData.address.line2,
                city: formData.address.city,
                postal_code: formData.address.postal_code,
                country: 'GB',
              }
            }
          }
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'An error occurred during payment');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        clearBasket();
        navigate('/order-success');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <button
              onClick={() => navigate('/basket')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Basket
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">
          {/* Left Column - Form */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact Information */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-4 border-b border-gray-200">
                <h2 className="text-base font-medium text-gray-900">Contact</h2>
              </div>
              <div className="px-4 py-4">
                {/* Contact Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChangeForm}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChangeForm}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
              </div>
              <div className="px-6 py-5">
                {/* Address Form Fields */}
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChangeForm}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address-line1" className="block text-sm font-medium text-gray-700">
                      Address line 1
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address-line1"
                        name="address.line1"
                        autoComplete="address-line1"
                        value={formData.address.line1}
                        onChange={handleChangeForm}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="address-line2" className="block text-sm font-medium text-gray-700">
                      Address line 2 (optional)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="address-line2"
                        name="address.line2"
                        autoComplete="address-line2"
                        value={formData.address.line2}
                        onChange={handleChangeForm}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-1">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="city"
                        name="address.city"
                        autoComplete="address-level2"
                        value={formData.address.city}
                        onChange={handleChangeForm}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-1">
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                      Postcode
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="postal_code"
                        name="address.postal_code"
                        autoComplete="postal-code"
                        value={formData.address.postal_code}
                        onChange={handleChangeForm}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-6">
                  {/* Card Payment Section */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex-1 border-t border-gray-200"></div>
                      <span className="px-3 text-sm text-gray-500">Pay with card</span>
                      <div className="flex-1 border-t border-gray-200"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-1">
                          Card number
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="text"
                            id="card-number"
                            name="card-number"
                            placeholder="1234 1234 1234 1234"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex flex-col">
                            <label htmlFor="card-expiry" className="text-sm font-medium text-gray-700 mb-1">
                              Expiry date
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id="card-expiry"
                                name="card-expiry"
                                placeholder="MM/YY"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex flex-col">
                            <label htmlFor="card-cvc" className="text-sm font-medium text-gray-700 mb-1">
                              CVC
                            </label>
                            <div className="mt-1 relative">
                              <input
                                type="text"
                                id="card-cvc"
                                name="card-cvc"
                                placeholder="CVC"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                  <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex flex-col">
                          <label htmlFor="card-name" className="text-sm font-medium text-gray-700 mb-1">
                            Name on card
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              id="card-name"
                              name="card-name"
                              placeholder="John Smith"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stripe Payment Element */}
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <PaymentElement 
                      options={{
                        layout: 'tabs',
                        fields: {
                          billingDetails: 'never'
                        }
                      }} 
                      onChange={handleChange}
                      onReady={handleReady}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="mt-8 lg:mt-0 lg:col-span-1">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
              </div>
              <div className="px-6 py-5">
                {/* Order Items */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="border rounded-lg p-3 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-10">{item.product.name}</h3>
                        <div className="mt-1 flex justify-between items-center">
                          <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                          <span className="text-sm font-medium text-gray-900">
                            £{(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>£{totalPrice().toFixed(2)}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Shipping: <span className="text-green-600">Free</span></p>
                </div>

                {/* Checkout Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isProcessing || !stripe || !isPaymentElementReady}
                    className="w-full bg-orange-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      `Pay £${totalPrice().toFixed(2)}`
                    )}
                  </button>
                </div>

                {/* Security Badge */}
                <div className="mt-6 flex justify-center">
                  <div className="inline-flex items-center text-sm text-gray-500">
                    Secure checkout
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { items } = useBasketStore();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/basket');
      return;
    }

    // Initialize payment intent
    const initializePayment = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch this from your server
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setClientSecret(MOCK_PAYMENT_INTENT.client_secret);
      } catch (err) {
        console.error('Error initializing payment:', err);
        toast.error('Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [items, navigate]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#ea580c',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
      rules: {
        '.Label': {
          fontSize: '14px',
          fontWeight: '500',
        },
        '.Input': {
          padding: '8px 12px',
          borderColor: '#d1d5db',
          borderRadius: '4px',
          '&:focus': {
            borderColor: '#ea580c',
            boxShadow: '0 0 0 1px #ea580c',
          },
        },
      },
    },
    loader: 'auto',
  };

  if (isLoading || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm clientSecret={clientSecret} />
    </Elements>
  );
};

export default Checkout;