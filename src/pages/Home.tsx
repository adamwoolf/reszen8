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
          <h2>Our Mission</h2>
          <div className="mission-text">
            <p>At RESZEN8, we believe that meditation should meet you where you are, whether you're seeking a moment of calm between meetings, a deeper connection to yourself, or simply a better night's sleep. Our mission is to make mindfulness more accessible, personal, and sustainable in the digital age.</p>
            <p>Through our custom-built platform, we offer more than just meditations, we offer meaningful tools for modern life. Our Digital Meditation Library is filled with sessions for every mood and moment, from relaxation to deep focus. The AI Meditation Generator creates personalised experiences that adapt to your needs, while your Personalised Dashboard keeps everything in one serene, simple place, your journey, your way.</p>
            <p>In a world that constantly demands more, RESZEN8 is here to help you slow down, tune in, and find your rhythm again. Because balance isn't a luxury, it's a necessity.</p>
          </div>
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
