import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBasketStore } from '../store/basketStore';

// Initialize Stripe with your test public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const TestPaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalPrice } = useBasketStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [amount, setAmount] = useState<number>(
    // Get amount from navigation state or use basket total
    location.state?.amount || totalPrice()
  );
  const [email, setEmail] = useState<string>('');

  // Create payment intent when component mounts or amount changes
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you would call your backend to create a payment intent
        // For testing, we'll use a mock client secret with a consistent format
        const mockClientSecret = `pi_mock_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2)}`;
        setClientSecret(mockClientSecret);
        
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, you would confirm the payment with your backend
      // For testing, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful payment
      toast.success(`Payment of £${(amount / 100).toFixed(2)} successful!`);
      navigate('/order-success');
      
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Basket
          </button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Payment</h1>
          <p className="text-gray-600">Use test card: 4242 4242 4242 4242</p>
          <p className="text-sm text-gray-500 mt-1">Any future date | Any 3 digits | Any postal code</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Test Card Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-medium">Card Number:</p>
              <p className="font-mono">4242 4242 4242 4242</p>
            </div>
            <div>
              <p className="font-medium">Expiry:</p>
              <p>Any future date</p>
            </div>
            <div>
              <p className="font-medium">CVC:</p>
              <p>Any 3 digits</p>
            </div>
            <div>
              <p className="font-medium">Postal Code:</p>
              <p>Any value</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="test@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (GBP)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">£</span>
              </div>
              <input
                type="number"
                id="amount"
                value={(amount / 100).toFixed(2)}
                readOnly
                className="bg-gray-50 focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          {clientSecret && (
            <div className="border-t border-gray-200 pt-4">
              <PaymentElement
                options={{
                  layout: {
                    type: 'tabs',
                    defaultCollapsed: false,
                  },
                }}
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe || isLoading || !clientSecret}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : `Pay £${(amount / 100).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

const TestPaymentPage = () => {
  return (
    <Elements 
      stripe={stripePromise}
      options={{
        mode: 'payment',
        amount: 2000, // Default amount in cents, will be overridden by state
        currency: 'gbp',
        paymentMethodCreation: 'manual',
      }}
    >
      <TestPaymentForm />
    </Elements>
  );
};

export default TestPaymentPage;
