import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useBasketStore } from '../store/basketStore';
import { toast } from 'react-hot-toast';
import { useNavigate, Navigate } from 'react-router-dom';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { usePurchasedItemsStore } from '../store/purchasedItemsStore';
import './Checkout.css';

// Initialize Stripe with test public key
const stripePromise = loadStripe('pk_test_51O...'); // Replace with your test public key

// Mock payment intent data for testing
const MOCK_PAYMENT_INTENT = {
  id: 'pi_mock_' + Math.random().toString(36).substr(2, 9),
  client_secret: 'pi_mock_secret_' + Math.random().toString(36).substr(2),
  amount: 1000, // Will be updated with actual basket total
  currency: 'gbp',
  status: 'requires_payment_method',
};

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  const navigate = useNavigate();
  const { items, totalPrice, clearBasket } = useBasketStore();
  const { addPurchasedItems } = usePurchasedItemsStore();

  // Redirect to basket if empty
  if (items.length === 0) {
    return <Navigate to="/basket" />;
  }

  // Handle payment element ready state
  const handleReady = () => {
    setIsPaymentElementReady(true);
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
        redirect: 'if_required'
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Add items to purchased items store
        addPurchasedItems(items.map(item => ({
          ...item.product,
          quantity: item.quantity
        })));
        
        // Clear basket on successful payment
        clearBasket();
        
        // Redirect to success page
        navigate('/order-success', { 
          state: { 
            paymentIntent,
            customer: {
              name: formData.name,
              email: formData.email
            }
          } 
        });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedTotal = (totalPrice()).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {/* Contact Information */}
      <section className="checkout-section">
        <h2 className="section-title">Contact Information</h2>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChangeForm}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChangeForm}
              required
            />
          </div>
        </div>
      </section>

      {/* Shipping Address */}
      <section className="checkout-section">
        <h2 className="section-title">Shipping Address</h2>
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChangeForm}
              required
            />
          </div>
          <div className="form-group full-width">
            <label htmlFor="address.line1">Address Line 1</label>
            <input
              type="text"
              id="address.line1"
              name="address.line1"
              value={formData.address.line1}
              onChange={handleChangeForm}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address.line2">Address Line 2 (Optional)</label>
            <input
              type="text"
              id="address.line2"
              name="address.line2"
              value={formData.address.line2}
              onChange={handleChangeForm}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address.city">City</label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={formData.address.city}
              onChange={handleChangeForm}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address.postal_code">Postal Code</label>
            <input
              type="text"
              id="address.postal_code"
              name="address.postal_code"
              value={formData.address.postal_code}
              onChange={handleChangeForm}
              required
            />
          </div>
        </div>
      </section>

      {/* Order Summary */}
      <section className="checkout-section order-summary">
        <h2 className="section-title">Order Summary</h2>
        <div className="order-items">
          {items.map((item, index) => (
            <div key={`${item.product.id}-${index}`} className="order-item">
              <div>
                <div className="font-medium">{item.product.name}</div>
                <div className="text-sm text-gray-400 space-y-1 mt-1">
                  {item.product.size && (
                    <div>Duration: {item.product.size}</div>
                  )}
                  <div>Qty: {item.quantity}</div>
                </div>
              </div>
              <span>£{(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="order-total">
          <span>Total</span>
          <span>£{(items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)).toFixed(2)}</span>
        </div>
        <button 
          onClick={() => navigate('/basket')} 
          className="back-link"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Basket
        </button>
      </section>

      {/* Payment Information */}
      <section className="checkout-section">
        <h2 className="section-title">Payment Information</h2>
        <div className="payment-method">
          <div className="payment-method-header">
            <h3>Payment Method</h3>
            <div className="payment-method-tabs">
              <button type="button" className="payment-tab active">
                <span>Pay with card</span>
              </button>
            </div>
          </div>
          
          <div className="card-details">
            <div className="form-group">
              <label htmlFor="cardNumber">Card number</label>
              <div className="card-input">
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 1234 1234 1234"
                  className="card-number"
                  maxLength={19}
                />
                <div className="card-icons">
                  <span className="card-icon visa"></span>
                  <span className="card-icon mastercard"></span>
                  <span className="card-icon amex"></span>
                </div>
              </div>
            </div>
            
            <div className="card-details-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry date</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  className="expiry-date"
                  maxLength={5}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cvc">CVC</label>
                <input
                  type="text"
                  id="cvc"
                  name="cvc"
                  placeholder="CVC"
                  className="cvc"
                  maxLength={4}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="cardName">Name on card</label>
              <input
                type="text"
                id="cardName"
                name="cardName"
                placeholder="John Smith"
                className="card-name"
              />
            </div>
          </div>
        </div>
        
        {error && <div className="payment-error">{error}</div>}
        <div className="form-actions">
          <button 
            type="submit" 
            className="pay-button"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay £${formattedTotal}`}
          </button>
        </div>
      </section>
    </form>
  );
};

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null>>();
  const { items } = useBasketStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Stripe with your publishable key
    setStripePromise(loadStripe('pk_test_51O...'));
    
    // In a real app, you would fetch the client secret from your server
    // For now, we'll use the mock client secret
    const mockClientSecret = 'pi_mock_secret_' + Math.random().toString(36).substr(2);
    setClientSecret(mockClientSecret);
  }, []);

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#FFA500',
      colorBackground: '#111111',
      colorText: '#f3f4f6',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // Redirect if basket is empty
  if (items.length === 0) {
    return <Navigate to="/basket" />;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your purchase and start your journey with us</p>
        </div>
        
        <div className="checkout-layout">
          <div className="checkout-main">
            {stripePromise && clientSecret && (
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm clientSecret={clientSecret} />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;