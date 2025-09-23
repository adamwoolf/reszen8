import React from "react";
import "./FooterHeroStyles.scss";
import { useAuth } from "../../contexts/AuthContext";
import ConsentsPopup from "../ConsentsPopup/ConsentsPopup";
import { Link } from "react-router-dom";
import appStore from "../../assets/app-store.webp";
import { useAuth as useAwsAuth } from "react-oidc-context";

const ourContent = [
  { label: "Home", path: "/" },
  { label: "Bespoke Meditation Generator", path: "bespoke-meditation-generator" },
  { label: "Articles", path: "articles" },
  { label: "Memberships", path: "memberships" },
  { label: "Meditation Library", path: "meditation-library" },
  { label: "My Journey", path: "journey" },
  { label: "Members Area", path: "members" },
];

const PoliciesContact = [
  { label: "Contact", path: "contact" },
  { label: "Terms & Conditions", path: "terms-and-conditions" },
  { label: "Privacy Policy", path: "privacy-policy" },
];

const FooterHero = () => {
  const { currentUser } = useAuth();
  const auth = useAwsAuth();

  const renderColumn = (array: []) => {
    return (
      <div className='footer-hero__column-list'>
        {array.map((item) => (
          <Link className='footer-hero__column-list-link' to={item.path}>
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

  return (
    <div className='footer-hero'>
      <div className='footer-hero__column'>
        <h3>Our Content</h3>
        {renderColumn(ourContent)}
      </div>
      <div className='footer-hero__column'>
        <h3>Policies & Contact</h3>
        {renderColumn(PoliciesContact)}
      </div>
      <div className='footer-hero__column'>
        <h3>My Reszen8</h3>
        {!currentUser && <button onClick={() => auth.signinRedirect()}>Sign in</button>}
        {currentUser && (
          <button className='logout-cta' onClick={handleLogout}>
            logout
          </button>
        )}
        <a href='https://apple.com'>
          <img className='footer-hero__app-store' src={appStore} />
        </a>
      </div>
      <ConsentsPopup />
    </div>
  );
};

export default FooterHero;
