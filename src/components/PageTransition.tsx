import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/PageTransition.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Significantly more noticeable variants
const pageVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1], // custom cubic-bezier for a premium feel
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -40,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  // Force scroll to top on page transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariants}
      className="page-wrapper"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
