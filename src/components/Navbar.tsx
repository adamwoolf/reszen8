import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CartIcon from "./CartIcon/CartIcon";
import { FaBars } from "react-icons/fa";
import "./Navbar.css";
import useFirebasedatabase from "../hooks/useFirestoreCollection";

export const CountDown = ({ user, lines = 1 }) => {
  const start = user?.subscription?.startDate;
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const targetDate = new Date(start);
    targetDate.setDate(targetDate.getDate() + 7);

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // update every second

    return () => clearInterval(interval);
  }, [start]); // Changed dependency to `start` since it's the relevant prop

  const { days, hours, minutes, seconds } = remaining;
  const hasTime = days + hours + minutes + seconds;

  const Tag = lines !== 1 ? "p" : "span";

  if (user?.subscription?.subscription === "monthly") return <span>Active Monthly Subscription</span>;

  return user?.subscription?.subscription === "free-trial" ? (
    hasTime ? (
      <span style={{ color: "inherit" }}>
        {" "}
        <Tag> Free trial time remaining: </Tag> {days}d {hours}h {minutes}m, {seconds}s
      </span>
    ) : (
      <span>Your free trial has expired. Please update your subscription </span>
    )
  ) : null;
};

const Navbar: React.FC = () => {
  const { currentUser, logout, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { addOrUpdate } = useFirebasedatabase("USERS");
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
  const newTrial = {
    duration: 7,
    hasCompletedTrial: false,
    isActiveSub: true,
    startDate: Date.now(),
    subscription: "free-trial",
  };
  console.log(currentUser);
  const resetTrial = () => {
    if (currentUser && currentUser.firebaseId && currentUser?.isGod && window.godControls) {
      const reset = () => {
        const newUserData = {
          ...currentUser,
          subscription: newTrial,
        };
        addOrUpdate(currentUser.firebaseId, newUserData);
        setCurrentUser(newUserData);
      };
      return (
        <button style={{ marginRight: 8 }} onClick={reset}>
          god reset free trial
        </button>
      );
    }
    return null;
  };
  const name = currentUser && currentUser?.firstName ? `${currentUser?.firstName} ${currentUser?.surName}: ` : "";
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

              {currentUser?.subscription?.isActiveSub && (
                <>
                  <li>
                    <NavLink to='/bespoke-meditation-generator' className={getNavLinkClass}>
                      Bespoke Meditation Generator
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/digital-library' className={getNavLinkClass}>
                      Digital Library
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/dashboard' className={getNavLinkClass}>
                      My Dashboard
                    </NavLink>
                  </li>
                </>
              )}
              {currentUser && (
                <li>
                  <NavLink to='/members' className={getNavLinkClass}>
                    Members Area
                  </NavLink>
                </li>
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
            <span className='countdown'>
              {resetTrial()}
              {<CountDown user={currentUser} />}
            </span>
            <span className='user-items-right'>
              <span className='user-address'>
                {name} {currentUser.email}
              </span>
              <button className='user-address' onClick={handleLogout}>
                Logout
              </button>
            </span>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
