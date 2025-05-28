import React from "react";
import { useNavigate } from "react-router-dom";
import { useBasketStore } from "../store/basketStore";
import "./Memberships.css";
import useContentful from "../hooks/useContentful";
import { getMembershipTiers, getMembershipPage, getFAQs } from "../contentful";

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
  const { addItem } = useBasketStore();

  const membershipTiers = useContentful(getMembershipTiers)?.content?.items;
  const content = useContentful(getMembershipPage)?.content?.fields;
  const faqs = useContentful(getFAQs)?.content?.items;
  console.log(faqs);

  const handleSubscribe = (tier: MembershipTier) => {
    if (tier.id === "bespoke-journey") {
      navigate("/contact");
      return;
    }
    addItem({
      id: tier.id,
      name: `${tier.name} (${tier.billing})`,
      price: tier.price,
      description: tier.description,
    });
    navigate("/basket");
  };

  return (
    <div className='memberships-page'>
      <header className='memberships-header'>
        <h1>{content?.title}</h1>
        <p className='subtitle'>{content?.subtitle}</p>
      </header>

      <div className='membership-grid'>
        {membershipTiers?.map(({ fields: tier }) => (
          <div key={tier.id} className={`membership-card ${tier.mostPopular ? "featured" : ""}`}>
            {tier.mostPopular && <div className='popular-badge'>Most Popular</div>}
            <div className='membership-header'>
              <h3>{tier.name}</h3>
              <div className='price'>
                {tier.price > 0 ? `£${tier.price.toFixed(2)}` : "Enquire for pricing"}
                {tier.billing !== "enquire" && <span className='billing'>/ {tier.billing}</span>}
              </div>
              <p className='description'>
                {tier.description}
                {tier.id === "bespoke-journey" && <span className='coming-soon-tag'>Coming Soon</span>}
              </p>
            </div>
            <ul className='features'>
              {tier.features.map((feature, index) => (
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
            <button
              className={`subscribe-button ${tier.mostPopular ? "featured-button" : ""}`}
              onClick={() => handleSubscribe(tier)}
            >
              {tier.id === "bespoke-journey" ? "Make Enquiry" : "Get Started"}
            </button>
          </div>
        ))}
      </div>

      <div className='membership-faq'>
        <h2>Frequently Asked Questions</h2>
        <div className='faq-grid'>
          {faqs?.map(({ fields: item }) => (
            <div className='faq-item'>
              <h3>{item?.question}</h3>
              <p>{item?.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Memberships;
