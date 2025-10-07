import React, { useState } from "react";
import "./CreditTopupStyles.scss";
import { FaArrowRight } from "react-icons/fa";
import Popup from "../Popup/Popup";
import { useBasketStore } from "../../store/basketStore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const CreditTopup = () => {
  const [show, setShow] = useState(false);
  const { addItem } = useBasketStore();
  const navigate = useNavigate();
  const { currentUser, updateUser } = useAuth();

  const options = [
    {
      priceId: "price_1SAzGrRpZB60VN5hHkOuaOjh",
      name: "20 Credits",
      price: "5.99",
      id: "creditTopup20",
      credits: 20,
    },
    {
      priceId: "price_1SAzFVRpZB60VN5hlXqOFzJV",
      name: "40 Credits",
      saving: 8,
      price: "10.99",
      id: "creditTopup40",
      credits: 40,
    },
    {
      priceId: "price_1SAzHpRpZB60VN5hqm9qKeij",
      name: "60 Credits",
      saving: 17,
      price: "14.99",
      id: "creditTopup60",
      credits: 60,
    },
    {
      priceId: "price_1SAzISRpZB60VN5hcsF6X0Ld",
      name: "80 Credits",
      saving: 21,
      price: "18.99",
      id: "creditTopup80",
      credits: 80,
    },
    {
      priceId: "price_1SAzJ4RpZB60VN5hmzlgIWEz",
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
        <div className='topup__container'>
          <h2>Bespoke Meditation Credit Topup</h2>
          <p>Extra credits will be added to your account and remain available until used. There is no expiry time.</p>
          <div className='topup__options'>
            {options.map((option) => (
              <div key={option.name} className='feature-card topup__option'>
                <h3>
                  {option.name} {option.saving && <span className='topup__saving'> {`(${option.saving}% saved)`}</span>}
                  {option.saving && <sup className='topup__saving'>*</sup>}
                </h3>
                <p>£{option.price}</p>
                {currentUser?.subscription.subId !== "free-trial" ? (
                  <button onClick={() => handleAdd(option)} className='subscribe-button topup__buy-now'>
                    Add to Basket
                  </button>
                ) : (
                  <Link
                    onClick={() => setShow(false)}
                    to='/memberships'
                    disabled
                    className='subscribe-button topup__buy-now'
                  >
                    Upgrade to Topup
                  </Link>
                )}
              </div>
            ))}
            <span></span>
          </div>
          <span className='topup__disclaimer'>
            <sup>*</sup>when compared to 20 credit topup
          </span>
        </div>
      </Popup>
    </div>
  );
};

export default CreditTopup;
