import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBasketStore } from '../store/basketStore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './CategoryPage.css';
const DigitalGoods = () => {
    const navigate = useNavigate();
    const { addItem } = useBasketStore();
    const subscriptionTiers = [
        {
            id: 'digital-monthly',
            name: 'Monthly Digital Membership',
            price: 14.99,
            type: 'monthly',
            description: 'Full access to all digital resources, billed monthly.'
        },
        {
            id: 'digital-annual',
            name: 'Annual Digital Membership',
            price: 119.99,
            type: 'annual',
            description: 'Full access to all digital resources, billed annually. Save 33% compared to monthly.'
        }
    ];
    const handleSubscribe = (tier) => {
        addItem({
            id: tier.id,
            name: tier.name,
            price: tier.price,
            description: tier.description
        });
        toast.success(`${tier.name} added to basket!`);
        // Optionally navigate to checkout
        // navigate('/checkout');
    };
    return (_jsxs("div", { className: "category-page", children: [_jsxs("header", { className: "category-header", children: [_jsx("h1", { children: "Digital Goods" }), _jsx("p", { className: "subtitle", children: "Digital resources to enhance your daily practice" })] }), _jsxs("section", { className: "category-content", children: [_jsxs("div", { className: "category-intro", children: [_jsx("p", { children: "In our increasingly digital world, RESZEN8 brings mindfulness to your devices with thoughtfully designed digital resources. Our collection of apps, guides, and audio experiences helps you maintain your practice anywhere, anytime." }), _jsx("p", { children: "Each digital product is created with the same attention to detail as our physical offerings, providing you with tools for mindfulness that integrate seamlessly into modern life." })] }), _jsxs("div", { className: "feature-grid", children: [_jsxs("div", { className: "feature-item", children: [_jsx("h3", { children: "Meditation Apps" }), _jsx("p", { children: "Simple, intuitive applications designed to guide your practice without distraction or unnecessary complexity." })] }), _jsxs("div", { className: "feature-item", children: [_jsx("h3", { children: "E-Books & Guides" }), _jsx("p", { children: "Comprehensive resources on mindfulness, breathwork, and meditation techniques written by experienced practitioners." })] }), _jsxs("div", { className: "feature-item", children: [_jsx("h3", { children: "Audio Libraries" }), _jsx("p", { children: "Curated collections of nature sounds, ambient music, and guided sessions to create the perfect atmosphere." })] }), _jsxs("div", { className: "feature-item", children: [_jsx("h3", { children: "Practice Journals" }), _jsx("p", { children: "Digital journals with prompts and tracking features to help you maintain consistency and reflect on your progress." })] })] }), _jsxs("div", { className: "digital-subscription", children: [_jsx("h2", { children: "RESZEN8 Digital Membership" }), _jsx("p", { children: "Our all-access digital subscription gives you unlimited access to our complete library of digital resources, including exclusive content not available elsewhere. Members receive new content monthly and can join our online community of like-minded practitioners." }), _jsx("div", { className: "subscription-tiers", children: subscriptionTiers.map((tier) => (_jsxs("div", { className: `tier ${tier.type === 'annual' ? 'featured' : ''}`, children: [_jsxs("div", { className: "tier-header", children: [_jsx("h3", { children: tier.type === 'annual' ? 'Annual' : 'Monthly' }), _jsxs("p", { className: "price", children: ["\u00A3", tier.price.toFixed(2)] })] }), tier.type === 'annual' && (_jsx("p", { className: "saving", children: "Save 33%" })), _jsx("button", { className: "cta-button", onClick: () => handleSubscribe(tier), children: "Subscribe" })] }, tier.id))) })] })] })] }));
};
export default DigitalGoods;
