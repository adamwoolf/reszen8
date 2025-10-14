import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FooterStyles.scss";
import { useAuth } from "../../contexts/AuthContext";
import FooterHero from "../FooterHero/FooterHero";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { currentUser, signOutRedirect, setCurrentUser } = useAuth();

  const handleLogout = async () => {
    console.log("logging");
    try {
      await signOutRedirect();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  return (
    <footer className='bg-gray-900 text-white py-6 border-t border-gray-800 w-full'>
      <FooterHero />
      <div className='container mx-auto px-4'>
        <div className='flex flex-col items-center justify-center text-center'>
          <p className='text-sm text-gray-400 mb-3'>{currentYear} RESZEN8. All rights reserved.</p>

          {currentUser && currentUser.isGod && (
            <Link
              aria-label='admin-page-link'
              to='/admin'
              className='text-orange-400 hover:text-orange-300 text-sm transition-colors duration-200'
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
