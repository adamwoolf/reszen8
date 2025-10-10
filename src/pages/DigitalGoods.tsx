import React from "react";
import { useBasketStore } from "../store/basketStore";
import { useNavigate } from "react-router-dom";
import "./CategoryPage.css";

type SubscriptionTier = {
  id: string;
  name: string;
  price: number;
  type: "monthly" | "annual";
  description: string;
};

const DigitalGoods: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useBasketStore();

  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: "digital-monthly",
      name: "Monthly Digital Membership",
      price: 14.99,
      type: "monthly",
      description: "Full access to all digital resources, billed monthly.",
    },
    {
      id: "digital-annual",
      name: "Annual Digital Membership",
      price: 119.99,
      type: "annual",
      description: "Full access to all digital resources, billed annually. Save 33% compared to monthly.",
    },
  ];

  const handleSubscribe = (tier: SubscriptionTier) => {
    addItem({
      id: tier.id,
      name: tier.name,
      price: tier.price,
      description: tier.description,
    });

    // Optionally navigate to checkout
    // navigate('/checkout');
  };

  return (
    <div className='category-page'>
      <header className='category-header'>
        <h1>Digital Goods</h1>
        <p className='subtitle'>Digital resources to enhance your daily practice</p>
      </header>

      <section className='category-content'>
        <div className='category-intro'>
          <p>
            In our increasingly digital world, RESZEN8 brings mindfulness to your devices with thoughtfully designed
            digital resources. Our collection of apps, guides, and audio experiences helps you maintain your practice
            anywhere, anytime.
          </p>
          <p>
            Each digital product is created with the same attention to detail as our physical offerings, providing you
            with tools for mindfulness that integrate seamlessly into modern life.
          </p>
        </div>

        <div className='feature-grid'>
          <div className='feature-item'>
            <h3>Meditation Apps</h3>
            <p>
              Simple, intuitive applications designed to guide your practice without distraction or unnecessary
              complexity.
            </p>
          </div>
          <div className='feature-item'>
            <h3>E-Books & Guides</h3>
            <p>
              Comprehensive resources on mindfulness, breathwork, and meditation techniques written by experienced
              practitioners.
            </p>
          </div>
          <div className='feature-item'>
            <h3>Audio Libraries</h3>
            <p>
              Curated collections of nature sounds, ambient music, and guided sessions to create the perfect atmosphere.
            </p>
          </div>
          <div className='feature-item'>
            <h3>Practice Journals</h3>
            <p>
              Digital journals with prompts and tracking features to help you maintain consistency and reflect on your
              progress.
            </p>
          </div>
        </div>

        <div className='digital-subscription'>
          <h2>RESZEN8 Digital Membership</h2>
          <p>
            Our all-access digital subscription gives you unlimited access to our complete library of digital resources,
            including exclusive content not available elsewhere. Members receive new content monthly and can join our
            online community of like-minded practitioners.
          </p>
          <div className='subscription-tiers'>
            {subscriptionTiers.map((tier) => (
              <div key={tier.id} className={`tier ${tier.type === "annual" ? "featured" : ""}`}>
                <div className='tier-header'>
                  <h3>{tier.type === "annual" ? "Annual" : "Monthly"}</h3>
                  <p className='price'>£{tier.price.toFixed(2)}</p>
                </div>
                {tier.type === "annual" && <p className='saving'>Save 33%</p>}
                <button className='cta-button' onClick={() => handleSubscribe(tier)}>
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DigitalGoods;
