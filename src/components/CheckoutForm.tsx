import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useBasketStore } from "../store/basketStore";
import { useNavigate } from "react-router-dom";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { clearBasket } = useBasketStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  // Set mounted state to prevent memory leaks...
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system is not ready. Please try again.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/success`,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed");
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Clear the basket and show success message
        clearBasket();
        navigate("/order-success");
      }
    } catch (err) {
      console.error("Payment error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      if (isMounted) {
        setIsProcessing(false);
      }
    }
  };

  if (!isMounted) {
    return (
      <div className='flex justify-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Card information</label>
          <div className='border border-gray-300 rounded-md p-3'>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#1f2937",
                    "::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                },
              }}
            />
          </div>
          {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
        </div>
      </div>

      <button
        type='submit'
        disabled={!stripe || isProcessing}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          !stripe || isProcessing ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isProcessing ? "Processing..." : `Pay Now`}
      </button>

      <div className='text-xs text-gray-500 mt-2 space-y-1'>
        <p>Test card: 4242 4242 4242 4242</p>
        <p>Any future date • Any 3 digits • Any postal code</p>
      </div>
    </form>
  );
};

export default CheckoutForm;
