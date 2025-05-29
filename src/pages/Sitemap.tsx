import React from 'react';
import { Link } from 'react-router-dom';

interface SitemapLink {
  path: string;
  label: string;
  priority: number;
  protected?: boolean;
}

interface SitemapData {
  [key: string]: SitemapLink[];
}

// Define the sitemap structure with proper types
const sitemapData: SitemapData = {
  'Main': [
    { path: '/', label: 'Homepage', priority: 1.0 },
    { path: '/home', label: 'Home', priority: 0.9 },
    { path: '/about', label: 'About', priority: 0.8 },
    { path: '/photos', label: 'Photos', priority: 0.7 },
    { path: '/contact', label: 'Contact', priority: 0.8 }
  ],
  'Shop & Services': [
    { path: '/apparel', label: 'Apparel', priority: 0.7 },
    { path: '/guided-meditations', label: 'Guided Meditations', priority: 0.7 },
    { path: '/memberships', label: 'Memberships', priority: 0.7 }
  ],
  'Account': [
    { path: '/login', label: 'Login', priority: 0.5 },
    { path: '/signup', label: 'Sign Up', priority: 0.5 }
  ],
  'Checkout Process': [
    { path: '/basket', label: 'Shopping Basket', priority: 0.6 },
    { path: '/checkout', label: 'Checkout', priority: 0.6 },
    { path: '/order-success', label: 'Order Confirmation', priority: 0.3 }
  ],
  'Member-Only Areas': [
    { path: '/members', label: 'Members Area', priority: 0.8, protected: true },
    { path: '/ai-chat', label: 'AI Chat', priority: 0.7, protected: true }
  ],
  'Legal': [
    { path: '/terms-and-conditions', label: 'Terms & Conditions', priority: 0.2 },
    { path: '/privacy-policy', label: 'Privacy Policy', priority: 0.2 }
  ],
  'Development': [
    { path: '/test-payment', label: 'Test Payment', priority: 0.1 }
  ]
};

const Sitemap: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Website Sitemap</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(sitemapData).map(([section, links]) => (
          <div key={section} className="bg-white bg-opacity-10 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-amber-400">{section}</h2>
            <div className="space-y-2">
              {links.map(({ path, label, priority, protected: isProtected }) => (
                <div key={path} className="flex justify-between items-center py-2 border-b border-gray-700">
                  <Link 
                    to={path} 
                    className="text-white hover:text-amber-400 transition-colors flex items-center"
                  >
                    {label}
                    {isProtected && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500 bg-opacity-20 text-amber-300 rounded-md">
                        Protected
                      </span>
                    )}
                  </Link>
                  <span className="text-xs text-gray-400">{priority.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sitemap;