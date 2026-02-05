import React from "react";
import "./FooterHeroStyles.scss";
import { useAuth } from "../../contexts/AuthContext";
import ConsentsPopup from "../ConsentsPopup/ConsentsPopup";
import { Link } from "react-router-dom";
import appStore from "../../assets/app-store.webp";
import { useAuth as useAwsAuth } from "react-oidc-context";
import SocialShare from "../SocialShare/SocialShare";
import logo from "../../assets/logoNew.png";
import { useSelector, useDispatch } from "react-redux";
import { setShowSignupModal } from "../../store/contentSlice";

const ourContent = [
  { label: "Home", path: "/" },
  { label: "Memberships", path: "/memberships" },
];

const members = [
  { label: "Bespoke Meditation Generator", path: "/bespoke-meditation-generator" },
  { label: "Meditation Library", path: "/meditation-library" },
  { label: "Articles", path: "/articles" },
  { label: "Your Journey", path: "/journey", triggerPopup: true },
  { label: "Members Area", path: "/members", triggerPopup: true },
];

const policiesContact = [
  { label: "Contact", path: "/contact" },
  { label: "Terms & Conditions", path: "/terms-and-conditions" },
  { label: "Privacy Policy", path: "/privacy-policy" },
];

const FooterHero = () => {
  const { currentUser, signOutRedirect } = useAuth();
  const auth = useAwsAuth();
  const locationAllowed = useSelector((state) => state?.content?.locationAllowed);
  const dispatch = useDispatch();
  const renderColumn = (array: [], memberRoutes = false) => {
    return (
      <div className='footer-hero__column-list'>
        {array.map((item) => {
          // if (item.triggerPopup)
          //   return (
          //     <button
          //       key={item.label}
          //       className='footer-hero__column-list-redirect'
          //       onClick={() => dispatch(setShowSignupModal(true))}
          //     >
          //       {item.label}
          //     </button>
          //   );
          return (
            <Link
              key={item.path}
              className='footer-hero__column-list-link'
              to={item.triggerPopup && !currentUser ? "/memberships" : item.path}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  };

  const handleLogout = async () => {
    console.log("logging");
    try {
      await signOutRedirect();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  if (!locationAllowed) return null;
  return (
    <div className='footer-hero'>
      <SocialShare url={"https://reszen8.com"} title={"RESZEN8"} quote={"Crafted Calm"} />
      <img className='footer-hero__logo' src={logo} />
      <div className='footer-hero__content'>
        <div className='footer-hero__column'>
          <h3>Site Pages</h3>
          {renderColumn(ourContent)}
          {renderColumn(members, true)}
        </div>
        <div className='footer-hero__column'>
          <h3>Policies & Contact</h3>
          {renderColumn(policiesContact)}
        </div>
        <div className='footer-hero__column'>
          <h3>My Reszen8</h3>
          {!currentUser && <button onClick={() => auth.signinRedirect()}>Sign in</button>}
          {currentUser && (
            <button className='logout-cta' onClick={handleLogout}>
              logout
            </button>
          )}
          <a
            aria-label='app-store-link'
            target='_blank'
            href='https://apps.apple.com/es/app/reszen8/id6752923475?l=en-GB'
          >
            <img alt='app-store-link' className='footer-hero__app-store' src={appStore} />
          </a>
        </div>
        <ConsentsPopup />
      </div>
    </div>
  );
};

export default FooterHero;
