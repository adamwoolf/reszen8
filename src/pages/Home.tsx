import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import PillarsCarousel from "../components/PillarsCarousel";
import "./Home.css";
import useContentful from "../hooks/useContentful";
import { getHomePage } from "../contentful";
import { marked } from "marked";

const features = [
  {
    title: "Digital Meditation Library",
    description: "Listen to your saved meditations, read meditation guides and customise your journey. Meditations for all requirements, from simple relaxation to focused practice",
    path: "/digital-library"
  },
  {
    title: "AI Meditation Generator",
    description: "Create personalised meditation sessions with AI & save them to your dashboard for later",
    path: "/ai-meditation"
  },
  {
    title: "Personalised Dashboard",
    description: "Listen to your saved meditations, read meditation guides and customise your journey",
    path: "/dashboard"
  }
];

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const content = useContentful(getHomePage)?.content?.fields;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const handleCardClick = (path: string, title: string) => {
    if (currentUser) {
      if (title === "AI Meditation Generator") {
        navigate('/ai-meditation-generator');
      } else {
        navigate(path);
      }
    }
  };

  return (
    <div className='home-page'>
      <section className='mission-statement'>
        <div className='mission-content'>
          <h2>{content?.title}</h2>
          {content?.description && (
            <p className='mission-text' dangerouslySetInnerHTML={{ __html: marked(content?.description) }} />
          )}
          {content?.tagline && <p className='mission-tagline'>{content?.tagline}</p>}
        </div>
      </section>
      
      <section className="features-section">
        <h2 className="features-title">Our Digital Meditation Product</h2>
        <motion.div 
          className="features-container"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className={`feature-card ${currentUser ? 'clickable' : ''}`}
              variants={item}
              whileHover={{ y: currentUser ? -10 : 0, transition: { duration: 0.2 } }}
              onClick={currentUser ? () => handleCardClick(feature.path, feature.title) : undefined}
              style={{ cursor: currentUser ? 'pointer' : 'default' }}
            >
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              {currentUser && <div className="feature-arrow">→</div>}
            </motion.div>
          ))}
        </motion.div>
        {!currentUser && (
          <div className="membership-cta-container">
            <button 
              className="membership-cta"
              onClick={() => navigate('/memberships')}
            >
              View Our Memberships
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
