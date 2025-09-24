import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../CategoryPage.scss";
import "../Home.scss";
import "./MembersArea.scss";
import { usePurchasedItemsStore } from "../../store/purchasedItemsStore";
import { useSavedItemsStore } from "../../store/savedItemsStore";
import { useBasketStore } from "../../store/basketStore";
import { FaTrash, FaArrowRight } from "react-icons/fa";
import { toast } from "react-hot-toast";
import CountDown from "../../components/AccountStatus/AccountStatus";

export default function MembersArea() {
  const { currentUser, logout } = useAuth();
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { purchasedItems } = usePurchasedItemsStore();
  const { savedItems, removeSavedItem, moveToBasket } = useSavedItemsStore();
  const { addItem } = useBasketStore();

  const handleCancelMembership = () => {
    // Add membership cancellation logic here
    // if (window.confirm("Are you sure you want to cancel your membership?")) {
    //   alert("Your membership has been cancelled. We're sorry to see you go!");
    //   setIsSubscribed(false);
    // }
  };

  const handleMoveToBasket = (item: any) => {
    const product = moveToBasket(item.id, item.size);
    if (product) {
      addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          size: product.size,
        },
        product.quantity
      );
      toast.success("Item moved to basket");
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className='home-page members-area'>
      <header className='mission-statement'>
        <div className='mission-content'>
          <h1>Welcome to Your Members Area</h1>
          <p className='mission-text'>
            Thank you for being a part of the RESZEN8 community. You can manage your membership below.
          </p>
          <p>
            Your unique referral code is: <span className='members-area__code'>{currentUser.referralCode}</span>
          </p>
          <p className='members-area__info'>
            {" "}
            Share this with a friend and when they enter it when signing up for one of our paid subscriptions, you both
            get 5 bespoke meditation credits for free!
          </p>
        </div>
      </header>
      {/* subscription details  panel */}
      <section className='features-section'>
        <div className='features-container'>
          <div className='feature-card membership-panel'>
            <h3 className='feature-title'>My Subscription</h3>

            {currentUser?.subscription?.subscription === "free-trial" ? (
              <div className='features-content'>
                <CountDown user={currentUser} />
              </div>
            ) : (
              <span>Monthly</span>
            )}
            {(!currentUser?.subscription?.isActiveSub || currentUser?.subscription?.subscription === "free-trial") && (
              <Link className='membership-cta' style={{ marginTop: "1rem" }} to='/memberships'>
                Upgrade Now
              </Link>
            )}
          </div>

          {/* Saved for Later Section */}
          <div className='feature-card '>
            <h3 className='feature-title'>My Basket</h3>
            {currentUser?.basket?.length > 0 ? (
              <div className='saved-items-container saved-item-block'>
                {currentUser?.basket?.map((item, index) => (
                  <div key={`saved-${item.id}-${index}`} className='saved-item'>
                    <div className='saved-item-details'>
                      <h4 className='saved-item-name'>{item.product.name}</h4>
                      {item.size && <p className='saved-item-size'>Size: {item.size}</p>}
                      <p className='saved-item-quantity'>Qty: {item.quantity || 1}</p>
                      <p className='saved-item-price'>£{item.product.price.toFixed(2)} each</p>
                      {item.savedAt && <p className='saved-item-date'>Saved: {formatDate(item.savedAt)}</p>}
                    </div>
                  </div>
                ))}
                <Link className='to-basket-link' to='/basket'>
                  <span className='to-basket-link-label'> Go to basket </span>
                  <FaArrowRight />{" "}
                </Link>
              </div>
            ) : (
              <p className='no-items-message'>You don't have any saved items. Save items from your basket for later.</p>
            )}
          </div>

          {/* Purchased Items Section */}
          <div className='feature-card'>
            <h3 className='feature-title'>Purchased Items</h3>
            {currentUser?.purchasedItems?.length > 0 ? (
              <div className='purchased-items-container'>
                {currentUser?.purchasedItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className='purchased-item'>
                    <div className='purchased-item-details'>
                      <h4 className='purchased-item-name'>{item.name}</h4>
                      {item.size && <p className='purchased-item-size'>Size: {item.size}</p>}
                      {item.quantity && <p className='purchased-item-quantity'>Qty: {item.quantity || 1}</p>}
                      <p className='purchased-item-price'>£{item.price.toFixed(2)}</p>
                      {item.purchaseDate && (
                        <p className='purchased-item-date'>Purchased: {formatDate(item.purchaseDate)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='no-items-message'>You haven't purchased any items yet. Visit our store to get started!</p>
            )}
          </div>

          {/* <div className='feature-card'>
            <h3 className='feature-title'>Account Security</h3>
            <p className='feature-description'>
              Keep your account secure by updating your password regularly.
              <br />
              <br />
              Reset your password to ensure your account remains protected.
            </p>
            <Link
              className='membership-cta'
              style={{
                marginTop: "1rem",
                background: "transparent",
                border: "2px solid #FFA500",
                color: "#FFA500",
              }}
              to='/forgot-password'
            >
              Reset Password
            </Link>
          </div> */}

          <div className='feature-card'>
            <h3 className='feature-title'>Cancel Membership</h3>
            <p className='feature-description'>
              We're sorry to see you go. If you cancel, you'll lose access to all premium features at the end of your
              billing period.
              <br />
              <br />
              <strong>Note:</strong> You can reactivate your membership at any time.
            </p>
            <button
              className='membership-cta'
              style={{
                marginTop: "1rem",
                background: "transparent",
                border: "2px solid #ff4d4d",
                color: "#ff4d4d",
              }}
              onClick={handleCancelMembership}
            >
              Cancel Membership
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
