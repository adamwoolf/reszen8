import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CartIcon from "./CartIcon/CartIcon";
import { FaBars } from "react-icons/fa";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper function to determine the active link style
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "nav-link active" : "nav-link");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className='navbar-container'>
          <div className='nav-brand'>
            <NavLink to='/'>RESZEN8</NavLink>
          </div>

          <div className='nav-sections'>
            <ul className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
              <li>
                <NavLink to='/home' end className={getNavLinkClass}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to='/memberships' className={getNavLinkClass}>
                  Memberships
                </NavLink>
              </li>
              <li>
                <NavLink to='/ai-chat' className={getNavLinkClass}>
                  RESZEN8 Chat
                </NavLink>
              </li>
              <li>
                <NavLink to='/apparel' className={getNavLinkClass}>
                  Apparel & Accessories
                </NavLink>
              </li>

              <li>
                <NavLink to='/guided-meditations' className={getNavLinkClass}>
                  Meditation Hub
                </NavLink>
              </li>

              {currentUser && (
                <>
                  <li>
                    <NavLink to='/members' className={getNavLinkClass}>
                      Members Area
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/dashboard' className={getNavLinkClass}>
                      My Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/members' className={getNavLinkClass}>
                      Account Management
                    </NavLink>
                  </li>
                </>
              )}
            </ul>

            <div className='nav-right'>
              <div className='flex items-center space-x-4'>
                <ul className='auth-links'>
                  <li className='flex items-center'>
                    <CartIcon />
                  </li>

                  {!currentUser && (
                    <>
                      <li>
                        <NavLink to='/login' className={getNavLinkClass}>
                          Login
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to='/signup' className='nav-link signup-btn'>
                          Sign Up
                        </NavLink>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <button
            className='mobile-menu-button'
            onClick={toggleMobileMenu}
            aria-label='Toggle menu'
            aria-expanded={isMobileMenuOpen}
          >
            <FaBars style={{ color: "orange", fontSize: 24 }} />
          </button>
        </div>
        {currentUser && (
          <div className='user-items'>
            <span className='user-address'>{currentUser.email}</span>
            <div className=''>
              <NavLink to='/members' className='block px-4 py-2 text-gray-700 hover:bg-gray-100'>
                My Account
              </NavLink>
              <button className='user-address' onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
