import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import AboutMe from './pages/AboutMe';
import Photos from './pages/Photos';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MembersArea from './pages/MembersArea';
import AIChat from './pages/AIChat';
import Apparel from './pages/Apparel';
import WellnessTools from './pages/WellnessTools';
import DigitalGoods from './pages/DigitalGoods';
import Meditations from './pages/Meditations';
import Accessories from './pages/Accessories';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import FloatingCTA from './components/FloatingCTA';
import NotFound from './pages/NotFound';
import './App.css';

// Layout component that wraps all pages except LandingPage
const Layout = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <PageTransition>
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </PageTransition>
      </main>
      <FloatingCTA />
    </div>
  </ErrorBoundary>
);

// AnimatedRoutes component to handle page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><AboutMe /></Layout>} />
        <Route path="/photos" element={<Layout><Photos /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/members" element={<PrivateRoute><Layout><MembersArea /></Layout></PrivateRoute>} />
        <Route path="/ai-chat" element={<PrivateRoute><Layout><AIChat /></Layout></PrivateRoute>} />
        <Route path="/apparel" element={<Layout><Apparel /></Layout>} />
        <Route path="/wellness-tools" element={<Layout><WellnessTools /></Layout>} />
        <Route path="/digital-goods" element={<Layout><DigitalGoods /></Layout>} />
        <Route path="/guided-meditations" element={<Layout><Meditations /></Layout>} />
        <Route path="/accessories" element={<Layout><Accessories /></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
        <Route path="/order-success" element={<Layout><OrderSuccess /></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;
