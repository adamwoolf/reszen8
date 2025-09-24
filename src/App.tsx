import React, { Suspense, useEffect, useState } from "react";
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
import AboutMe from "./pages/AboutMe";
import Contact from "./pages/Contact";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import MembersArea from "./pages/MembersArea/MembersArea";
import Dashboard from "./pages/Dashboard/Dashboard";
import DigitalLibrary from "./pages/MeditationLibrary/MeditationLibrary";
import AIChat from "./pages/AIChat";
import Apparel from "./pages/Apparel/Apparel";
import AIMeditationGenerator from "./pages/MeditationGenerator/AIMeditationGenerator";
import Checkout from "./pages/Checkout/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Memberships from "./pages/Memberships";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TestPaymentPage from "./pages/TestPaymentPage";
import Sitemap from "./pages/Sitemap";
import LoadingSpinner from "./components/LoadingSpinner";
import FloatingCTA from "./components/FloatingCTA";
import Footer from "./components/Footer/Footer";
import NotFound from "./pages/NotFound";
import Basket from "./pages/Basket/Basket";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import PasswordResetPage from "./pages/PasswordReset/PasswordReset";
import UserManager from "./components/UserManager";
import Publications from "./pages/Publications/Publications";
import FullPublication from "./pages/Publications/FullPublication";
import { Helmet } from "react-helmet";

import Admin from "./pages/Admin/Admin";
import LoadingScene from "./components/LoadingScene/LoadingScene";
import { useSelector } from "react-redux";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;

  // return currentUser?.subscription?.isActiveSub ? <>{children}</> : <Navigate to='/login' replace />;
  return currentUser ? <>{children}</> : <Navigate to='/' />;
};

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  return currentUser ? <>{children}</> : <Navigate to='/' />;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useAuth();
  const landingPageActive = useSelector((state) => state.content.landingPageActive);

  if (loading) return <LoadingScene />;
  if (landingPageActive) return null;
  return (
    // <ErrorBoundary>
    <div className='app-container'>
      <Helmet>
        <title>Welcome to Reszen8</title>
        <meta name='description' content='Your destination for meditative experiences.' />
        <meta name='robots' content='index, follow' />
      </Helmet>
      <main className='main-content flex-grow'>
        <PageTransition>
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </PageTransition>
      </main>
      <Footer />
      <FloatingCTA />
      <ToastContainer aria-label={"toast"} position='bottom-right' autoClose={3000} />
    </div>
    // </ErrorBoundary>
  );
};

// AnimatedRoutes component to handle page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
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
          path='/about'
          element={
            <Layout>
              <AboutMe />
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
          path='/meditation-library'
          element={
            <ProtectedRoute>
              <Layout>
                <DigitalLibrary />
              </Layout>
            </ProtectedRoute>
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
        <Route
          path='/apparel'
          element={
            <Layout>
              <Apparel />
            </Layout>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <Layout>
              <PasswordResetPage />
            </Layout>
          }
        />

        <Route
          path='/bespoke-meditation-generator'
          element={
            <ProtectedRoute>
              <Layout>
                <AIMeditationGenerator />
              </Layout>
            </ProtectedRoute>
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
        <Route
          path='/order-success'
          element={
            <Layout>
              <OrderSuccess />
            </Layout>
          }
        />
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
            <Layout>
              <Publications />
            </Layout>
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
        <Route
          path='/test-payment'
          element={
            <Layout>
              <TestPaymentPage />
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
                  <LandingPage />
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
