import React, { useEffect, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { useBasketStore } from "../../store/basketStore";
import { useNavigate, Navigate } from "react-router-dom";
import { usePurchasedItemsStore } from "../../store/purchasedItemsStore";
import "./Checkout.scss";
import { useAuth } from "../../contexts/AuthContext";
import { AWS_DB_ENDPOINT } from "../../constants";
import { trackCTA } from "../../utils/analytics";

import ThreeDotsLoader from "../../components/ThreeDotsLoads";
import { createCheckoutSession } from "../../store/apiUtils";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearBasket } = useBasketStore();
  const { addPurchasedItems } = usePurchasedItemsStore();
  const { currentUser, updateUser } = useAuth();
  const [waiting, setWaiting] = useState(false);

  // Redirect to basket if empty
  if (items.length === 0) {
    return <Navigate to='/basket' />;
  }

  const handleSubmitStripe = async (e: React.FormEvent) => {
    trackCTA("Checkout");
    e.preventDefault();
    const { email, firstName, surName } = currentUser || {};
    const item = items?.[0]?.product;
    setWaiting(true);

    console.log("MODE", items);
    const res = await fetch(`${AWS_DB_ENDPOINT}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "payment",
        email,
        firstName,
        lastName: surName,
        uid: currentUser?.uid,
        planId: item.priceId,
        metadata: { uid: currentUser?.uid },
        lineItems: [{ priceId: item.priceId, quantity: 1 }], // 👈 send array of line items
        subscription: {
          extraBespokeMeditationCredits: item.value,
        },
      }),
    });

    const data = await res.json();

    await updateUser(currentUser?.uid, { basket: [] });
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: data.sessionId });

    setWaiting(false);
  };

  return (
    <form onSubmit={handleSubmitStripe} className='checkout-form'>
      {/* Order Summary */}
      <section>
        <h2 className='section-title'>Order Summary</h2>
        <div className='order-items'>
          {items.map((item, index) => (
            <div key={`${item.product.id}-${index}`} className='order-item'>
              <div>
                <div className='font-medium'>{item.product.name}</div>
                <div className='text-sm text-gray-400 space-y-1 mt-1'>
                  {item.product.size && <div>Duration: {item.product.size}</div>}
                  <div>Qty: {item.quantity}</div>
                </div>
              </div>
              <span>£{(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className='order-total'>
          <span>Total</span>
          <span>£{items.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)}</span>
        </div>
        <button type='button' onClick={() => navigate("/basket")} className='back-link'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
          </svg>
          Back to Basket
        </button>
        {/* <SubscribeButton uid={currentUser.uid} priceId={daySubPrice} /> */}
      </section>

      {/* Payment Information */}
      <section className='checkout-section'>
        <div>
          <div className='payment-method-header'>
            <button className='payment-tab active'>Pay Now{waiting && <ThreeDotsLoader />}</button>
            <p className='checkout__disclaimer'> All payment are handled by Stripe (secure payment page)</p>
            <p className='checkout__disclaimer'>
              {" "}
              As Reszen8 is currently only available to UK residents, we can only accept payments from UK issued bank
              cards.
            </p>
            {/* {items.some(item => item?.product?.id === 'digital-monthly') && currentUser?.isGod && window.godControls && <button type="button" onClick={godSignUp} >God test monthly signup</button>} */}
          </div>
        </div>
      </section>
    </form>
  );
};

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null>>();
  const { items } = useBasketStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Stripe with your publishable key
    setStripePromise(loadStripe("pk_test_51O..."));

    // In a real app, you would fetch the client secret from your server
    // For now, we'll use the mock client secret
    const mockClientSecret = "pi_mock_secret_" + Math.random().toString(36).substr(2);
    setClientSecret(mockClientSecret);
  }, []);

  const appearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#FFA500",
      colorBackground: "#111111",
      colorText: "#f3f4f6",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // Redirect if basket is empty
  if (items.length === 0) {
    return <Navigate to='/basket' />;
  }

  return (
    <div className='checkout-page'>
      <div className='checkout-container'>
        <div className='checkout-header'>
          <h1>Checkout</h1>
          <p>Complete your purchase and start your journey with us</p>
        </div>

        <div className='checkout-layout'>
          <div className='checkout-main'>{stripePromise && clientSecret && <CheckoutForm />}</div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
