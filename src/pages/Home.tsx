import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Home.scss";
import useContentful from "../hooks/useContentful";
import { getHomePage } from "../contentful";
import { marked } from "marked";
import FreeForever from "../components/FreeForever/FreeForever";
import Collections from "../components/Collections/Collections";
import CollectionsCarousel from "../components/CollectionsCarousel/CollectionsCarousel";
import { sendEmailSES } from "../store/apiUtils";

const features = [
  // {
  //   title: "Digital Meditation Library",
  //   description:
  //     "Listen to your saved meditations, read meditation guides and customise your journey. Meditations for all requirements, from simple relaxation to focused practice",
  //   path: "/digital-library",
  // },
  {
    title: "Articles",
    description:
      "Read meditation guides and customise your journey. Meditations for all requirements, from simple relaxation to focused practice",
    path: "/articles",
  },
  {
    title: "Bespoke Meditation Generator",
    description:
      "Create personalised meditation sessions with Reszen8's unique,  bespoke Meditation Generator & save them to Your Journey for later",
    path: "/bespoke-meditation-generator",
  },
  {
    title: "Your Journey",
    description: "Listen to your saved meditations, read meditation guides and customise your journey",
    path: "/journey",
  },
  // {
  //   title: "7 Day Free Trial",
  //   description:
  //     "Start your journey to mindfulness with our risk-free trial. Get full access to all digital platform features for 7 days.",
  //   path: "/memberships",
  //   isTrial: true,
  // },
];

const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const content = useContentful(getHomePage)?.content;
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className='home-page'>
      <section className='mission-statement'>
        <div className='mission-content'>
          <h2>{content?.title}</h2>
          <div className='mission-text'>
            {content?.description && <p dangerouslySetInnerHTML={{ __html: marked(content?.description) }} />}
          </div>
        </div>
      </section>
      {/* <Drawing /> */}
      <FreeForever />
      <CollectionsCarousel />
      <section className='features-section'>
        <h2 className='features-title'>Our Digital Meditation Product</h2>
        <motion.div
          className='features-container'
          variants={container}
          initial='hidden'
          whileInView='show'
          viewport={{ once: true, amount: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`feature-card ${currentUser || feature.isTrial ? "clickable" : ""}`}
              variants={item}
              whileHover={{ y: currentUser || feature.isTrial ? -10 : 0, transition: { duration: 0.2 } }}
              onClick={() =>
                currentUser?.subscription?.subId === "reszen8-generate" && feature.path === "/articles"
                  ? null
                  : navigate(feature.path)
              }
              style={{
                cursor: currentUser || feature.isTrial ? "pointer" : "default",
                border: feature.isTrial ? "2px solid #FFA500" : "1px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {feature.isTrial && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "#FFA500",
                    color: "#000",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Popular
                </div>
              )}
              <h3 className='feature-title' style={feature.isTrial ? { color: "#FFA500" } : {}}>
                {feature.title}
              </h3>
              <p className='feature-description'>{feature.description}</p>
              {(currentUser || feature.isTrial) && <div className='feature-arrow'>→</div>}
            </motion.div>
          ))}
        </motion.div>
        {!currentUser && (
          <div className='membership-cta-container'>
            <button className='membership-cta' onClick={() => navigate("/memberships")}>
              View Our Memberships
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

const Drawing = () => {
  const radius = 100;
  const stroke = 3;
  // const outerRadius = 200;
  const innerRadius = 70;
  const cy = 80;
  const cx = 80;
  return (
    <div className='test-container'>
      <div className='test' />
      <div className='test2' />
    </div>
  );
};
