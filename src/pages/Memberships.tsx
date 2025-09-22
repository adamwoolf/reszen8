import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBasketStore } from "../store/basketStore";
import "./Memberships.scss";
import useContentful from "../hooks/useContentful";
import { getMembershipTiers, getMembershipPage, getFAQs } from "../contentful";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useAuth as useAWSAuth } from "react-oidc-context";

type MembershipTier = {
  id: string;
  name: string;
  type: "digital" | "premium";
  price: number;
  billing: "monthly" | "annual" | "enquire";
  description: string;
  features: string[];
  mostPopular?: boolean;
};

const Memberships: React.FC = () => {
  const navigate = useNavigate();
  const { addItem, items } = useBasketStore();
  const { currentUser } = useAuth();
  const membershipTiers = useContentful(getMembershipTiers)?.content?.items;
  const content = useContentful(getMembershipPage)?.content?.fields;
  const faqs = useContentful(getFAQs)?.content?.items;
  const auth = useAWSAuth();

  // Define the standard features for Digital Hub memberships
  const digitalHubFeatures = [
    "Full Meditation Library access",
    "AI Meditation Generator",
    "Personalized 'My Journey'",
    "New content when available",
    "Access to E-Books",
    "Access to publications",
    "RESZEN8 AI chat",
  ];

  const handleSubscribe = (tier: MembershipTier) => {
    if (tier.id === "bespoke-journey") {
      navigate("/contact");
      return;
    }
    if (tier.freeTrial) {
      auth.signinRedirect();
      return;
    }
    // Create a proper product object with all required fields
    const product = {
      id: tier.id,
      name: tier.name || "Membership", // Ensure name is always defined
      price: tier.price || 0,
      description: tier.description || "",
      size: tier.billing, // Store billing cycle as size
      priceId: tier.priceId, // for Stripe subscriptions
      medCredits: tier.medCredits,
      type: "subscription",
    };
    console.log("Adding to basket:", product); // Debug log
    addItem(product);
    navigate("/basket");
  };
  return (
    <div className='memberships-page'>
      <header className='memberships-header'>
        <h1>{content?.title}</h1>
        <p className='subtitle'>{content?.subtitle}</p>
      </header>

      <div className='membership-grid'>
        {membershipTiers
          ?.sort((a: any, b: any) => a.fields.order - b.fields.order)
          ?.map(({ fields: tier }) => {
            // Use the standard features for Digital Hub memberships and free trial
            const isDigitalHub = tier.title?.toLowerCase().includes("digital hub") || tier.type === "digital";
            const featuresToShow = isDigitalHub ? digitalHubFeatures : tier.features;
            const isAdded = items.some((item) => item.product.id === tier.id);

            return (
              <div key={tier.id} className={`membership-card ${tier.freeTrial ? "free-trial" : ""}`}>
                <div className='membership-header'>
                  <h3>{tier.title}</h3>
                  {tier?.badge && (
                    <div className='popular-badge'>
                      {currentUser?.subscription?.hasCompletedTrial ? "Completed" : tier?.badge}
                    </div>
                  )}
                  {!tier.title.includes("Enterprise") ? (
                    <div className='price'>
                      {tier.price > 0 ? `£${tier.price.toFixed(2)}` : "£0.00"}
                      {tier.billing !== "enquire" && <span className='billing'>/ {tier.billing}</span>}
                    </div>
                  ) : (
                    <h4 className='please-enquire'>{tier.billing}</h4>
                  )}
                  <p className='description'>
                    {tier.description}
                    {tier.id === "bespoke-journey" && <span className='coming-soon-tag'>Coming Soon</span>}
                  </p>
                </div>
                <ul className='features'>
                  {featuresToShow.map((feature: string, index: number) => (
                    <li key={index} className='feature-item'>
                      <svg className='check-icon' viewBox='0 0 20 20' fill='currentColor'>
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {currentUser?.subscription?.subId === tier.id && <div className='popular-badge'>Active</div>}
                {currentUser?.subscription?.subscription === tier.id ||
                currentUser?.subscription?.subId === tier.id ||
                (currentUser?.subscription?.hasCompletedTrial && tier.id === "free-trial") ||
                isAdded ||
                tier.title.includes("Enterprise") ? (
                  <></>
                ) : !currentUser && tier.id !== "free-trial" ? (
                  <button className='subscribe-button' disabled>
                    Upgrade from Free Trial
                  </button>
                ) : (
                  <button
                    className={`subscribe-button ${tier.mostPopular ? "featured-button" : ""}`}
                    onClick={() => handleSubscribe(tier)}
                  >
                    {tier.id === "bespoke-journey" ? "Make Enquiry" : tier.freeTrial ? "Start Free Trial" : "Buy"}
                  </button>
                )}
                {isAdded && (
                  <button disabled className='subscribe-button'>
                    Added to Basket
                  </button>
                )}
                {tier.title.includes("Enterprise") && (
                  <Link style={{ textAlign: "center" }} className='subscribe-button' to='/contact'>
                    Make an enquiry
                  </Link>
                )}
              </div>
            );
          })}
      </div>

      <div className='membership-faq'>
        <h2>Frequently Asked Questions</h2>
        <div className='faq-grid'>
          {faqs?.map(({ fields }: { fields: { item: { question: string; answer: string } } }) => (
            <div className='faq-item'>
              <h3>{fields?.question}</h3>
              <p>{fields?.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Memberships;
