import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white py-6 border-t border-gray-800 w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-gray-400 mb-3">
            {currentYear} RESZEN8. All rights reserved.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link 
              to="/terms-and-conditions" 
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors duration-200"
            >
              Terms & Conditions
            </Link>
            <span className="text-gray-500">|</span>
            <Link 
              to="/privacy-policy" 
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors duration-200"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
