import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PlayerProvider } from "./contexts/AudioContext";

import { SavedItemsProvider } from "./contexts/SavedItemsContext";
import { BasketProvider } from "./contexts/BasketContext";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import MembersArea from "./pages/MembersArea/MembersArea";
import Dashboard from "./pages/Dashboard/Dashboard";
import DigitalLibrary from "./pages/MeditationLibrary/MeditationLibrary";
import Apparel from "./pages/Apparel/Apparel";
import AIMeditationGenerator from "./pages/MeditationGenerator/AIMeditationGenerator";
import Checkout from "./pages/Checkout/Checkout";
import Memberships from "./pages/Memberships/Memberships";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Sitemap from "./pages/Sitemap";
import LoadingSpinner from "./components/LoadingSpinner";
import FloatingCTA from "./components/FloatingCTA";
import Footer from "./components/Footer/Footer";
import NotFound from "./pages/NotFound";
import Basket from "./pages/Basket/Basket";
import "./App.css";
import UserManager from "./components/UserManager";
import Publications from "./pages/Publications/Publications";
import FullPublication from "./pages/Publications/FullPublication";
import { Helmet } from "react-helmet";

import Admin from "./pages/Admin/Admin";
import LoadingScene from "./components/LoadingScene/LoadingScene";
import { useSelector } from "react-redux";
import CookieBanner from "./components/CookieBanner/CookieBanner";
import { useAnalytics } from "./hooks/useAnalytics";
import Toast from "./components/Toast/ToastContainer";
import LocationManager from "./components/LocationManager/LocationManager";
import LocationBlocked from "./pages/LocationBlocked/LocationBlocked";
import SignupModal from "./components/SignupModal/SignupModal";
import Insights from "./pages/Insights/Insights";
import MeditationPopup from "./components/MeditationPopup/MeditationPopup";
import Enterprise from "./pages/Enterprise/Enterprise";
import EnterpriseUserLogin from "./pages/Enterprise/EnterpriseUserLogin";
// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScene />;
  }

  if (!currentUser) {
    // Store the intended destination
    sessionStorage.setItem("redirectAfterLogin", location.pathname + location.search);
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScene />;
  }

  if (!currentUser) {
    // Store the intended destination
    sessionStorage.setItem("redirectAfterLogin", location.pathname + location.search);
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { loading, currentUser, isEnterprise } = useAuth();
  const landingPageActive = useSelector((state) => state.content.landingPageActive);
  useAnalytics();

  // return <LoadingScene />;

  if (loading) return <LoadingScene />;
  // if (landingPageActive) return null;
  // if (isEnterprise && !currentUser) return <EnterpriseUserLogin />;
  return (
    // <ErrorBoundary>
    <div className='app-container'>
      <Helmet>
        {/* Title & Meta */}
        <title>RESZEN8</title>
        <meta name='description' content='Bespoke wellbeing & meditation solutions.' />
        <meta name='robots' content='index, follow' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />

        {/* Favicon */}
        <link rel='icon' type='image/png' href='https://reszen8.com/logoNew.png' />

        {/* Open Graph / Facebook */}
        <meta property='og:title' content='Reszen8.com' />
        <meta property='og:description' content='Bespoke wellbeing & meditation solutions.' />
        <meta property='og:image' content='https://reszen8.com/logoNew.png' />
        <meta property='og:url' content='https://reszen8.com' />
        <meta property='og:type' content='website' />

        {/* Twitter Card */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='Reszen8.com' />
        <meta name='twitter:description' content='Bespoke wellbeing & meditation solutions.' />
        <meta name='twitter:image' content='https://reszen8.com/logoNew.png' />

        {/* Structured Data for Google */}
        <script type='application/ld+json'>
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Reszen8",
            url: "https://reszen8.com",
            logo: "https://reszen8.com/logoNew.png",
          })}
        </script>
      </Helmet>
      <main className='main-content flex-grow'>
        <Toast />
        <PageTransition>
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </PageTransition>
      </main>
      <Footer />
      <SignupModal />
      <FloatingCTA />
      <CookieBanner />
      <MeditationPopup />
    </div>
    // </ErrorBoundary>
  );
};

// AnimatedRoutes component to handle page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route
          path='/'
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path='/contact'
          element={
            <Layout>
              <Contact />
            </Layout>
          }
        />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path='/members'
          element={
            <UserRoute>
              <Layout>
                <MembersArea />
              </Layout>
            </UserRoute>
          }
        />
        <Route
          path='/journey'
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/enterprise'
          element={
            <Layout>
              <Enterprise />
            </Layout>
          }
        />
        <Route
          path='/meditation-library'
          element={
            // <ProtectedRoute>
            <Layout>
              <DigitalLibrary />
            </Layout>
            // </ProtectedRoute>
          }
        />
        <Route
          path='/meditation-library/:title'
          element={
            // <ProtectedRoute>
            <Layout>
              <DigitalLibrary />
            </Layout>
            // </ProtectedRoute>
          }
        />
        <Route
          path='/insights'
          element={
            // <ProtectedRoute>
            <Layout>
              <Insights />
            </Layout>
            // </ProtectedRoute>
          }
        />
        <Route
          path='/admin'
          element={
            <ProtectedRoute>
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* <Route
          path='/ai-chat'
          element={
            <Layout>
              <AIChat />
            </Layout>
          }
        /> */}

        {/* Public Routes */}
        {/* <Route
          path='/apparel'
          element={
            <Layout>
              <Apparel />
            </Layout>
          }
        /> */}

        <Route
          path='/bespoke-meditation-generator'
          element={
            <Navigate to='/' replace />
            // <ProtectedRoute>
            // <Layout>
            //   <AIMeditationGenerator />
            // </Layout>
            // </ProtectedRoute>
          }
        />
        <Route
          path='/checkout'
          element={
            <Layout>
              <Checkout />
            </Layout>
          }
        />
        <Route
          path='/basket'
          element={
            <Layout>
              <Basket />
            </Layout>
          }
        />
        {/* <Route
          path='/order-success'
          element={
            <Layout>
              <OrderSuccess />
            </Layout>
          }
        /> */}
        <Route
          path='/articles/:slug'
          element={
            <Layout>
              <FullPublication />
            </Layout>
          }
        />
        <Route
          path='/articles'
          element={
            // <ProtectedRoute>
            <Layout>
              <Publications />
            </Layout>
            // </ProtectedRoute>
          }
        />
        <Route
          path='/location-blocked'
          element={
            <ProtectedRoute>
              <Layout>
                <LocationBlocked />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/memberships'
          element={
            <Layout>
              <Memberships />
            </Layout>
          }
        />
        <Route
          path='/terms-and-conditions'
          element={
            <Layout>
              <TermsAndConditions />
            </Layout>
          }
        />
        <Route
          path='/privacy-policy'
          element={
            <Layout>
              <PrivacyPolicy />
            </Layout>
          }
        />
        <Route
          path='/sitemap'
          element={
            <Layout>
              <Sitemap />
            </Layout>
          }
        />

        {/* 404 Route */}
        <Route
          path='*'
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <PlayerProvider>
          <BasketProvider>
            <SavedItemsProvider>
              <UserManager>
                <div className='main-content-wrapper'>
                  <Navbar />
                  {/* <LandingPage /> */}
                  <AnimatedRoutes />
                </div>
              </UserManager>
            </SavedItemsProvider>
          </BasketProvider>
        </PlayerProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
