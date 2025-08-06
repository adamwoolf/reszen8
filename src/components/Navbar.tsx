import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CartIcon from "./CartIcon/CartIcon";
import { FaBars } from "react-icons/fa";
import "./Navbar.scss";
import useFirebasedatabase from "../hooks/useFirestoreCollection";
import AccountStatus from "../components/AccountStatus/AccountStatus";
import useSendMail from "../hooks/useSendEmail";
import Search from "./Search/Search";
import { useSelector } from "react-redux";

const Navbar: React.FC = () => {
  const { currentUser, logout, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { addOrUpdate } = useFirebasedatabase("USERS");
  const { sendMail } = useSendMail();
  const dashboardCount =
    currentUser?.savedItems?.meditations?.length || 0 + currentUser?.savedItems?.publications?.length || 0;
  const meds = useSelector((state) => state?.content?.meditations);
  const userBespokeMeds =
    meds && currentUser ? Object.values(meds).filter((med) => med.generatedBy === currentUser?.uid)?.length : 0;

  const dashboardTotal = dashboardCount + userBespokeMeds;
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
    meditationCredits: 8,
  };

  const resetTrial = () => {
    if (currentUser && currentUser.firebaseId && currentUser?.isGod && window.godControls) {
      const reset = () => {
        const newUserData = {
          ...currentUser,
          subscription: newTrial,
          purchasedItems: [{ name: "Free Trial", price: 0, purchasedDate: Date.now() }],
        };
        addOrUpdate(currentUser.firebaseId, newUserData);
        setCurrentUser(newUserData);
        sendMail(`welcome, ${currentUser?.name}`, "Welcome to your RESZEN8 Free Trial!", currentUser?.email);
        sendMail(
          `${currentUser?.name} just started a free trial`,
          `New user: ${currentUser?.name}: ${currentUser?.email}:`,
          "connect@reszen8.com"
        );
      };
      return (
        <button style={{ marginRight: 8 }} onClick={reset}>
          god reset free trial
        </button>
      );
    }
    return null;
  };

  const endSub = () => {
    if (currentUser && currentUser.firebaseId && currentUser?.isGod && window.godControls) {
      const reset = () => {
        const thirtyFiveDaysAgo = Date.now() - 35 * 24 * 60 * 60 * 1000;

        const newUserData = {
          ...currentUser,
          subscription: { ...newTrial, startDate: thirtyFiveDaysAgo, hasCompletedTrial: true },
        };
        addOrUpdate(currentUser.firebaseId, newUserData);
        setCurrentUser(newUserData);
        sendMail("we are sorry to see you go", "RESZEN8 cancellation", currentUser?.email);
        sendMail(
          `${currentUser?.name} just cancelled`,
          `${currentUser?.name}: ${currentUser?.email}:  RESZEN8 cancellation`,
          "connect@reszen8.com"
        );
      };
      return (
        <button style={{ marginRight: 8 }} onClick={reset}>
          end sub
        </button>
      );
    }
    return null;
  };
  const name = currentUser && currentUser?.firstName ? `${currentUser?.firstName} ${currentUser?.surName} ` : "";
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
                <NavLink to='/publications' className={getNavLinkClass}>
                  Publications
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
                    <NavLink to='/meditation-library' className={getNavLinkClass}>
                      Meditation Library
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/dashboard' className={getNavLinkClass}>
                      My Dashboard <span className='nav-link__count'> ({dashboardTotal ?? ""})</span>
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
                  {currentUser && (
                    <li className='flex items-center'>
                      <CartIcon />
                    </li>
                  )}

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
              {endSub()}
              {<AccountStatus user={currentUser} />}
            </span>
            <Search />

            <span className='user-items-right'>
              <span className='user-address'>{name}</span>
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
