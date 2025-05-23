import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="page-container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-500">Terms and Conditions</h1>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString('en-GB')}</p>
      
      <div className="prose prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">1. Introduction</h2>
          <p className="mb-4">
            Welcome to RESZEN8. These Terms and Conditions govern your use of our website and services. 
            By accessing or using our website, you agree to be bound by these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">2. Intellectual Property Rights</h2>
          <p className="mb-4">
            Unless otherwise stated, we or our licensors own the intellectual property rights in the website and material on the website. 
            Subject to the license below, all these intellectual property rights are reserved.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">3. License to Use Website</h2>
          <p className="mb-4">
            You may view, download for caching purposes only, and print pages from the website for your own personal use, 
            subject to the restrictions set out below and elsewhere in these terms and conditions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">4. Acceptable Use</h2>
          <p className="mb-4">
            You must not use our website in any way that causes, or may cause, damage to the website or impairment of the 
            availability or accessibility of the website; or in any way which is unlawful, illegal, fraudulent or harmful.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">5. Limitations of Liability</h2>
          <p className="mb-4">
            We will not be liable to you (whether under the law of contract, the law of torts or otherwise) in relation to 
            the contents of, or use of, or otherwise in connection with, this website for any indirect, special or 
            consequential loss; or for any business losses, loss of revenue, income, profits or anticipated savings, loss 
            of contracts or business relationships, loss of reputation or goodwill, or loss or corruption of information or data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">6. Variation</h2>
          <p className="mb-4">
            We may revise these terms and conditions from time-to-time. The revised terms and conditions shall apply to the 
            use of our website from the date of publication of the revised terms and conditions on our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">7. Law and Jurisdiction</h2>
          <p className="mb-4">
            These terms and conditions will be governed by and construed in accordance with the laws of England and Wales, 
            and any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the 
            courts of England and Wales.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-orange-400">8. Our Details</h2>
          <p className="mb-4">
            This website is owned and operated by RESZEN8. Our principal place of business is in the United Kingdom.
            You can contact us by email at support@reszen8.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
