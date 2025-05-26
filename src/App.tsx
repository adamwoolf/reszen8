import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BasketProvider } from "./contexts/BasketContext";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import AboutMe from "./pages/AboutMe";
import Photos from "./pages/Photos";
import Contact from "./pages/Contact";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup";
import MembersArea from "./pages/MembersArea";
import AIChat from "./pages/AIChat";
import Apparel from "./pages/Apparel/Apparel";
import Meditations from "./pages/Meditations";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Memberships from "./pages/Memberships";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TestPaymentPage from "./pages/TestPaymentPage";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import FloatingCTA from "./components/FloatingCTA";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import Basket from "./pages/Basket/Basket";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to='/login' />;
};

// Layout component that wraps all pages except LandingPage
const Layout = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <div className='app-container flex flex-col min-h-screen'>
      <Navbar />
      <main className='main-content flex-grow'>
        <PageTransition>
          <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
        </PageTransition>
      </main>
      <Footer />
      <FloatingCTA />
      <ToastContainer aria-label={"toast"} position='bottom-right' autoClose={3000} />
    </div>
  </ErrorBoundary>
);

// AnimatedRoutes component to handle page transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<LandingPage />} />
        <Route
          path='/home'
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
          path='/photos'
          element={
            <Layout>
              <Photos />
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
            <ProtectedRoute>
              <Layout>
                <MembersArea />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/ai-chat'
          element={
            <ProtectedRoute>
              <Layout>
                <AIChat />
              </Layout>
            </ProtectedRoute>
          }
        />

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
          path='/guided-meditations'
          element={
            <Layout>
              <Meditations />
            </Layout>
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
    <BasketProvider>
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </BasketProvider>
  );
}

export default App;
