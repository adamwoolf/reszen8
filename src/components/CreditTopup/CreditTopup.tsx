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
      name: "20 Bespoke Meditation Credits",
      price: "6.50",
      id: "creditTopup20",
      credits: 20,
    },
    {
      priceId: "price_1SAp7xRpZB60VN5h0X6zEm9P",
      name: "40 Bespoke Meditation Credits",
      price: "10",
      id: "creditTopup40",
      credits: 40,
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
        <div className='topup__options'>
          <h2>Bespoke Meditation Credit Topup</h2>
          <p>Extra credits will be added to your account and remain available until used. There is no expiry time.</p>
          {options.map((option) => (
            <div className='feature-card'>
              <h3>{option.name}</h3>
              <p>£{option.price}</p>
              <button onClick={() => handleAdd(option)} className='subscribe-button topup__buy-now'>
                Add to Basket
              </button>
            </div>
          ))}
        </div>
      </Popup>
    </div>
  );
};

export default CreditTopup;
