import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import "../CategoryPage.scss";
import "../Home.scss";
import "./MembersArea.scss";
import { usePurchasedItemsStore } from "../../store/purchasedItemsStore";
import { useSavedItemsStore } from "../../store/savedItemsStore";
import { useBasketStore } from "../../store/basketStore";
import { FaArrowRight } from "react-icons/fa";
import CountDown from "../../components/AccountStatus/AccountStatus";
import InviteAFriend from "../../components/InviteAFriend/InviteAFriend";
import { IoMdLogOut } from "react-icons/io";
import React from "react";
import CancellationCta from "../../components/CancellationCta/CancellationCta";
import InvoicePopup from "./InvoicePopup";
import ConsentsConsole from "./ConsentsConsole";

export default function MembersArea() {
  const { currentUser, signOutRedirect } = useAuth();
  const { moveToBasket } = useSavedItemsStore();
  const { addItem } = useBasketStore();

  const cancellationTime = new Date(currentUser?.subscription?.willCancelOn * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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

  function sortByDate(items, order = "desc") {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  }

  return (
    <div className='home-page members-area'>
      <header className='mission-statement'>
        <div className='mission-content'>
          <h1>Welcome to Your Members Area</h1>
          <p className='mission-text'>
            Thank you for being a part of the RESZEN8 community. You can manage your membership below.
          </p>

          <p>
            Your unique referral code is: <span className='members-area__code'>{currentUser?.referralCode}</span>
          </p>
          <p className='members-area__info'>
            Give your code to a friend (or pop their email in below). When they sign up to a membership, you both get 5
            free meditation tokens!
          </p>

          <InviteAFriend />
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
              <>
                <p className='members-area__info'>
                  Current plan:{" "}
                  <b>
                    {currentUser?.subscription?.planName && currentUser?.subscription?.active
                      ? currentUser?.subscription?.planName
                      : " You don't currently have an active subscription."}{" "}
                  </b>
                </p>
                <p className='members-area__info'>
                  Email: <span>{currentUser?.email}</span>
                </p>
                <div className='members-area__info'>
                  <span> Included meditation tokens:</span> <span>{currentUser?.subscription?.meditationCredits}</span>
                </div>
                <p className='members-area__info'>
                  Extra meditation tokens: <span> {currentUser?.subscription?.extraBespokeMeditationCredits}</span>
                </p>
                {currentUser?.timeUntilRenewal && !currentUser?.subscription.cancelAtPeriodEnd && (
                  <p className='members-area__info'>Renews in: {currentUser?.timeUntilRenewal}</p>
                )}
                {cancellationTime && currentUser?.subscription?.willCancelOn && (
                  <p>
                    Your subscription will end on:
                    <br /> <span style={{ color: "orange" }}>{cancellationTime}</span>
                  </p>
                )}
              </>
            )}
            {/* <InvoicePopup /> */}
            {(!currentUser?.subscription?.isActiveSub || currentUser?.subscription?.subscription === "free-trial") && (
              <Link className='membership-cta' style={{ marginTop: "1rem" }} to='/memberships'>
                Change Plan{" "}
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
                      <p className='purchased-item-date'>Qty: {item.quantity || 1}</p>
                      <p className='purchased-item-date'>£{item.product.price.toFixed(2)} each</p>
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

          <div className='feature-card'>
            <ConsentsConsole compact />
          </div>

          {/* Purchased Items Section */}
          <div className='feature-card'>
            <h3 className='feature-title'>Purchased Items</h3>

            {currentUser?.purchasedItems?.length > 0 ? (
              <>
                <div className='purchased-items-container'>
                  {sortByDate(currentUser?.purchasedItems)?.map((item, index) => {
                    const date = new Date(item.date);
                    return (
                      <div key={`${item.id}-${index}`} className='purchased-item'>
                        <div className='purchased-item-details'>
                          <h4 className='purchased-item-name'>{item.title}</h4>
                          {item.date && <p className='purchased-item-date'>Purchase date: {date.toDateString()}</p>}
                          {item.quantity && <p className='purchased-item-quantity'>Qty: {item.quantity || 1}</p>}
                          <p className='purchased-item-date'>£{item.price.toFixed(2)}</p>
                          {item.purchaseDate && (
                            <p className='purchased-item-date'>Purchased: {formatDate(item.purchaseDate)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className='no-items-message'>You haven't purchased any items yet. Visit our store to get started!</p>
            )}
          </div>

          {currentUser && currentUser?.subscription?.subId !== "free-trial" && (
            <div className='feature-card'>
              <h3 className='feature-title'>Cancel Membership</h3>
              <p className='feature-description'>
                We're sorry to see you go. If you cancel, you'll lose access to all premium features at the end of your
                billing period. Until then, as long as you have meditation tokens, you will still be able to access the
                Bespoke Generator and listen to your Bespoke Meditation in the Your Journey area..
                <br />
                <br />
                <strong>Note:</strong> You can reactivate your membership at any time.
              </p>
              {cancellationTime && currentUser?.subscription?.willCancelOn && (
                <p>
                  Your subscription will end on:
                  <br /> <span style={{ color: "orange" }}>{cancellationTime}</span>
                </p>
              )}
              <CancellationCta />
            </div>
          )}
          <div className='feature-card logout-card'>
            <h3 className='feature-title'>Logout</h3>

            <button type='button' className='user-address' onClick={signOutRedirect}>
              <IoMdLogOut size={80} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
