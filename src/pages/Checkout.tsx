import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useBasketStore } from '../store/basketStore';
import CheckoutForm from '../components/CheckoutForm';
import { toast } from 'react-hot-toast';

// Initialize Stripe with error handling
let stripePromise;
try {
  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  if (!stripePublicKey) {
    throw new Error('Stripe public key is not defined in environment variables');
  }
  stripePromise = loadStripe(stripePublicKey);
} catch (err) {
  console.error('Failed to initialize Stripe:', err);
  toast.error('Failed to initialize payment system. Please try again later.');
}

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, totalPrice, clearBasket } = useBasketStore();
  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (items.length === 0) return;
    if (!stripePromise) {
      setError('Payment system is not available. Please try again later.');
      return;
    }

    const createPaymentIntent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Creating payment intent for amount:', totalPrice());
        const response = await fetch(`${apiUrl}/create-payment-intent`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: totalPrice(),
            items: items.map(item => ({
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity
            }))
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create payment intent');
        }
        
        const { clientSecret } = await response.json();
        console.log('Received client secret');
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err.message || 'Failed to initialize payment');
        toast.error(err.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [items, totalPrice, apiUrl]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your basket is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your basket before checking out.</p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Preparing your payment...</p>
              </div>
            ) : clientSecret ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
                  <Elements 
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#2563eb',
                        },
                      },
                    }}
                  >
                    <CheckoutForm />
                  </Elements>
                </div>
                
                <div className="md:border-l md:border-gray-200 md:pl-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.quantity} × {item.product.name}
                        </span>
                        <span className="font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between font-medium text-gray-900">
                        <span>Total</span>
                        <span>${totalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-red-600">Failed to load payment form. Please try again.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
