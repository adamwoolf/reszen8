import React from "react";
import "./FooterHeroStyles.scss";
import { useAuth } from "../../contexts/AuthContext";
import ConsentsPopup from "../ConsentsPopup/ConsentsPopup";
import { Link } from "react-router-dom";
import appStore from "../../assets/app-store.webp";
import { useAuth as useAwsAuth } from "react-oidc-context";
import SocialShare from "../SocialShare/SocialShare";
import logo from "../../assets/logoNew.png";
import { useSelector } from "react-redux";

const ourContent = [
  { label: "Home", path: "/" },
  { label: "Memberships", path: "/memberships" },
];

const members = [
  { label: "Bespoke Meditation Generator", path: "/bespoke-meditation-generator" },
  { label: "Meditation Library", path: "/meditation-library" },
  { label: "Articles", path: "/articles" },
  { label: "Your Journey", path: "/journey" },
  { label: "Members Area", path: "/members" },
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
  const renderColumn = (array: [], memberRoutes = false) => {
    if (memberRoutes && !currentUser)
      return (
        <div className='footer-hero__column-list'>
          {array.map((item) => (
            <button
              key={item.label}
              className='footer-hero__column-list-redirect'
              onClick={() => auth.signinRedirect()}
            >
              {item.label}
            </button>
          ))}
        </div>
      );
    return (
      <div className='footer-hero__column-list'>
        {array.map((item) => (
          <Link key={item.path} className='footer-hero__column-list-link' to={item.path}>
            {item.label}
          </Link>
        ))}
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
          <h3>Our Content</h3>
          {renderColumn(ourContent)}
        </div>
        <div className='footer-hero__column'>
          <h3>Member Pages</h3>
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
