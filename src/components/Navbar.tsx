import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CartIcon from './CartIcon';
import './Navbar.css';

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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to determine the active link style
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? 'nav-link active' : 'nav-link';
    
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="nav-brand">
          <NavLink to="/">
            RESZEN8
          </NavLink>
        </div>

        <div className="nav-sections">
          <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
            <li>
              <NavLink to="/home" end className={getNavLinkClass}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/memberships" className={getNavLinkClass}>
                Memberships
              </NavLink>
            </li>
            <li>
              <NavLink to="/ai-chat" className={getNavLinkClass}>
                RESZEN8 Chat
              </NavLink>
            </li>
            <li>
              <NavLink to="/apparel" className={getNavLinkClass}>
                Apparel & Accessories
              </NavLink>
            </li>
            <li>
              <NavLink to="/guided-meditations" className={getNavLinkClass}>
                Meditation Hub
              </NavLink>
            </li>
            {currentUser && (
              <>
                <li>
                  <NavLink to="/dashboard" className={getNavLinkClass}>
                    My Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/members" className={getNavLinkClass}>
                    Account Management
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="nav-right">
            <div className="flex items-center space-x-4">
              <ul className="auth-links flex items-center space-x-4">
                <li className="flex items-center">
                  <CartIcon />
                </li>
                
                {currentUser ? (
                  <li className="relative group">
                    <button className="nav-link flex items-center">
                      {currentUser.email}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                      <NavLink to="/members" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">My Account</NavLink>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </li>
                ) : (
                  <>
                    <li>
                      <NavLink to="/login" className={getNavLinkClass}>
                        Login
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/signup" className="nav-link signup-btn">
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
          className="mobile-menu-button" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;