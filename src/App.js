import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from "react";
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
import Sitemap from "./pages/Sitemap";
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
const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: '/login' });
};
// Layout component that wraps all pages except LandingPage
const Layout = ({ children }) => (_jsx(ErrorBoundary, { children: _jsxs("div", { className: 'app-container flex flex-col min-h-screen', children: [_jsx(Navbar, {}), _jsx("main", { className: 'main-content flex-grow', children: _jsx(PageTransition, { children: _jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: children }) }) }), _jsx(Footer, {}), _jsx(FloatingCTA, {}), _jsx(ToastContainer, { "aria-label": "toast", position: 'bottom-right', autoClose: 3000 })] }) }));
// AnimatedRoutes component to handle page transitions
const AnimatedRoutes = () => {
    const location = useLocation();
    return (_jsx(AnimatePresence, { mode: 'wait', children: _jsxs(Routes, { location: location, children: [_jsx(Route, { path: '/', element: _jsx(LandingPage, {}) }), _jsx(Route, { path: '/home', element: _jsx(Layout, { children: _jsx(Home, {}) }) }), _jsx(Route, { path: '/about', element: _jsx(Layout, { children: _jsx(AboutMe, {}) }) }), _jsx(Route, { path: '/photos', element: _jsx(Layout, { children: _jsx(Photos, {}) }) }), _jsx(Route, { path: '/contact', element: _jsx(Layout, { children: _jsx(Contact, {}) }) }), _jsx(Route, { path: '/login', element: _jsx(Login, {}) }), _jsx(Route, { path: '/signup', element: _jsx(Signup, {}) }), _jsx(Route, { path: '/members', element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(MembersArea, {}) }) }) }), _jsx(Route, { path: '/ai-chat', element: _jsx(ProtectedRoute, { children: _jsx(Layout, { children: _jsx(AIChat, {}) }) }) }), _jsx(Route, { path: '/apparel', element: _jsx(Layout, { children: _jsx(Apparel, {}) }) }), _jsx(Route, { path: '/guided-meditations', element: _jsx(Layout, { children: _jsx(Meditations, {}) }) }), _jsx(Route, { path: '/checkout', element: _jsx(Layout, { children: _jsx(Checkout, {}) }) }), _jsx(Route, { path: '/basket', element: _jsx(Layout, { children: _jsx(Basket, {}) }) }), _jsx(Route, { path: '/order-success', element: _jsx(Layout, { children: _jsx(OrderSuccess, {}) }) }), _jsx(Route, { path: '/memberships', element: _jsx(Layout, { children: _jsx(Memberships, {}) }) }), _jsx(Route, { path: '/terms-and-conditions', element: _jsx(Layout, { children: _jsx(TermsAndConditions, {}) }) }), _jsx(Route, { path: '/privacy-policy', element: _jsx(Layout, { children: _jsx(PrivacyPolicy, {}) }) }), _jsx(Route, { path: '/sitemap', element: _jsx(Layout, { children: _jsx(Sitemap, {}) }) }), _jsx(Route, { path: '/test-payment', element: _jsx(Layout, { children: _jsx(TestPaymentPage, {}) }) }), _jsx(Route, { path: '*', element: _jsx(Layout, { children: _jsx(NotFound, {}) }) })] }, location.pathname) }));
};
function App() {
    return (_jsx(BasketProvider, { children: _jsx(AuthProvider, { children: _jsx(Router, { children: _jsx(AnimatedRoutes, {}) }) }) }));
}
export default App;
