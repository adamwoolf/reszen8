import React, { useState } from "react";
import "./CreditTopupStyles.scss";
import { FaArrowRight } from "react-icons/fa";
import Popup from "../Popup/Popup";
import { useBasketStore } from "../../store/basketStore";
import { useNavigate } from "react-router-dom";

const CreditTopup = () => {
  const [show, setShow] = useState(false);
  const { addItem, items } = useBasketStore();
  const navigate = useNavigate();

  const options = [
    {
      priceId: "price_1SAp7ORpZB60VN5hJs9n6z6M",
      name: "20 Credits",
      price: "5.99",
      id: "creditTopup20",
      credits: 20,
    },
    {
      priceId: "price_1SAp7xRpZB60VN5h0X6zEm9P",
      name: "40 Credits",
      saving: 8,
      price: "10.99",
      id: "creditTopup40",
      credits: 40,
    },
    {
      priceId: "price_1SAp7xRpZB60VN5h0X6zEm9P",
      name: "60 Credits",
      saving: 17,
      price: "14.99",
      id: "creditTopup60",
      credits: 60,
    },
    {
      priceId: "price_1SAp7xRpZB60VN5h0X6zEm9P",
      name: "80 Credits",
      saving: 21,
      price: "18.99",
      id: "creditTopup80",
      credits: 80,
    },
    {
      priceId: "price_1SAp7xRpZB60VN5h0X6zEm9P",
      name: "100 Credits",
      saving: 23,
      price: "22.99",
      id: "creditTopup100",
      credits: 100,
    },
  ];

  const handleAdd = (item: any) => {
    // Create a proper product object with all required fields
    const product = {
      id: item.id,
      name: item.name, // Ensure name is always defined
      price: +item.price || 0,
      description: "Bespoke Meditation credit topup pack",
      priceId: item.priceId, // for Stripe subscriptions
      type: "payment",
      value: item.credits,
    };

    addItem(product);
    navigate("/basket");
    setShow(false);
  };

  return (
    <div className='topup'>
      <button onClick={() => setShow(true)} className='topup__cta'>
        top up <FaArrowRight />
      </button>
      <Popup show={show} onClose={() => setShow(false)} fitContent>
        <h2>Bespoke Meditation Credit Topup</h2>
        <p>Extra credits will be added to your account and remain available until used. There is no expiry time.</p>
        <div className='topup__options'>
          {options.map((option) => (
            <div className='feature-card'>
              <h3>
                {option.name} {option.saving && `(${option.saving}% saved)`}
                {option.saving && <sup>*</sup>}
              </h3>
              <p>£{option.price}</p>
              <button onClick={() => handleAdd(option)} className='subscribe-button topup__buy-now'>
                Add to Basket
              </button>
            </div>
          ))}
          <span></span>
        </div>
        <span className='topup__disclaimer'>
          <sup>*</sup>when compared to 20 credit topup
        </span>
      </Popup>
    </div>
  );
};

export default CreditTopup;
