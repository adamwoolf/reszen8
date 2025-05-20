import React from 'react';
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
import './App.css';

// Layout component that wraps all pages except LandingPage
const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <header>
      <Navbar />
    </header>
    <main className="main-content">
      {children}
    </main>
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} RESZEN8. All rights reserved.</p>
    </footer>
  </>
);

// AnimatedRoutes component to handle page transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Layout><PageTransition><Home /></PageTransition></Layout>} />
        <Route path="/about" element={<Layout><PageTransition><AboutMe /></PageTransition></Layout>} />
        <Route path="/photos" element={<Layout><PageTransition><Photos /></PageTransition></Layout>} />
        <Route path="/contact" element={<Layout><PageTransition><Contact /></PageTransition></Layout>} />
        <Route path="/login" element={<Layout><PageTransition><Login /></PageTransition></Layout>} />
        <Route path="/signup" element={<Layout><PageTransition><Signup /></PageTransition></Layout>} />
        <Route path="/members" element={<Layout><PageTransition><PrivateRoute><MembersArea /></PrivateRoute></PageTransition></Layout>} />
        <Route path="/ai-chat" element={<Layout><PageTransition><AIChat /></PageTransition></Layout>} />
        <Route path="/apparel" element={<Layout><PageTransition><Apparel /></PageTransition></Layout>} />
        <Route path="/wellness-tools" element={<Layout><PageTransition><WellnessTools /></PageTransition></Layout>} />
        <Route path="/digital-goods" element={<Layout><PageTransition><DigitalGoods /></PageTransition></Layout>} />
        <Route path="/guided-meditations" element={<Layout><PageTransition><Meditations /></PageTransition></Layout>} />
        <Route path="/accessories" element={<Layout><PageTransition><Accessories /></PageTransition></Layout>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
