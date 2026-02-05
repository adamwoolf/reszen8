import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CartIcon from "./CartIcon/CartIcon";
import { FaBars, FaUser, FaUserAlt, FaShare, FaShareAlt } from "react-icons/fa";
import "./Navbar.scss";
import AccountStatus from "../components/AccountStatus/AccountStatus";
import useSendMail from "../hooks/useSendEmail";
import Search from "./Search/Search";
import { useSelector } from "react-redux";
import { useAuth as useAwsAuth } from "react-oidc-context";
import { getStaticMeditations, getPublications } from "../store/contentSelectors";
import { trackCTA } from "../utils/analytics";
import user from "../assets/logoNew.png";

import ShareCta from "./ShareCta/ShareCta";
const Navbar: React.FC = () => {
  const auth = useAwsAuth();
  const { currentUser, setCurrentUser, signOutRedirect, loading } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { sendMail } = useSendMail();
  const dashboardCount =
    currentUser?.savedItems?.meditations?.length ||
    0 + currentUser?.savedItems?.publications?.length ||
    0 + currentUser?.savedItems?.collections?.length ||
    0;
  const meds = useSelector((state) => state?.content?.meditations);
  const userBespokeMeds =
    meds && currentUser ? Object.values(meds).filter((med) => med.createdBy === currentUser?.uid)?.length : 0;
  const staticMeds = useSelector(getStaticMeditations)?.filter((med) => !med.introMed);

  const articles = useSelector(getPublications);
  const landingPageActive = useSelector((state) => state.content.landingPageActive);
  const dashboardTotal = dashboardCount + userBespokeMeds;

  const locationAllowed = useSelector((state) => state?.content?.locationAllowed);

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

  const newTrial = {
    duration: 7,
    hasCompletedTrial: false,
    isActiveSub: true,
    startDate: Date.now(),
    subscription: "free-trial",
    meditationCredits: 8,
  };

  const name = currentUser && currentUser?.firstName ? `${currentUser?.firstName} ` : "";
  if (loading || landingPageActive) return null;
  return (
    <div className='appbar-wrapper'>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className='navbar-container'>
          <div className='nav-brand'>
            <NavLink to='/'>RESZEN8</NavLink>
          </div>
          {locationAllowed && (
            <>
              {currentUser && (
                <div className='navbar__search-mobile'>
                  <Search />
                </div>
              )}
              <div className='nav-sections'>
                <ul className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
                  <li>
                    <NavLink to='/' end className={getNavLinkClass}>
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/memberships' className={getNavLinkClass}>
                      Memberships
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/meditation-library' className={getNavLinkClass}>
                      Meditations
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/bespoke-meditation-generator' className={getNavLinkClass}>
                      Bespoke
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to='/insights' className={getNavLinkClass}>
                      RESZEN8 Insights
                    </NavLink>
                  </li>

                  <li>
                    <NavLink to='/articles' className={getNavLinkClass}>
                      Articles
                    </NavLink>
                  </li>

                  {/* <li>
                <NavLink to='/ai-chat' className={getNavLinkClass}>
                  RESZEN8 Chat
                </NavLink>
              </li> */}

                  {(currentUser?.subscription?.active || currentUser?.subscription?.isActiveSub) && (
                    <>
                      <li>
                        <NavLink to='/journey' className={getNavLinkClass}>
                          Your Journey <span className='nav-link__count'> ({dashboardTotal ?? ""})</span>
                        </NavLink>
                      </li>
                    </>
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

                      {!currentUser && !loading && (
                        <>
                          <button
                            onClick={() => {
                              trackCTA("Sign In");
                              auth.signinRedirect();
                            }}
                          >
                            Sign in
                          </button>
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
            </>
          )}
        </div>
        {currentUser && locationAllowed && (
          <div className='user-items'>
            <span className='countdown'>{<AccountStatus user={currentUser} />}</span>
            <div className='navbar__search-desktop'>
              <Search />
            </div>
            <span className='user-items-right'>
              {currentUser && (
                <NavLink className='user-link' to='/members'>
                  <img src={user} className='user-icon' />
                  <span className='user-address'>{name}</span>
                </NavLink>
              )}
              <ShareCta />
            </span>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
