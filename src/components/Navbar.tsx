import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
          <NavLink to="/home">
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
              <NavLink to="/contact" className={getNavLinkClass}>
                Contact
              </NavLink>
            </li>
          </ul>

          <div className="nav-right">
            <ul className="auth-links">
              {currentUser ? (
                <li>
                  <button onClick={handleLogout} className="nav-button">
                    Logout
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <NavLink to="/login" className="auth-link">
                      Log in
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/signup" className="auth-button">
                      Join
                    </NavLink>
                  </li>
                </>
              )}
            </ul>

            <button
              className="mobile-menu-button"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
