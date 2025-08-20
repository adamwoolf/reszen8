import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className='page-container max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6 text-orange-500'>Privacy Policy</h1>
      <p className='mb-4'>Last updated: {new Date().toLocaleDateString("en-GB")}</p>

      <div className='prose prose-invert max-w-none'>
        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4 text-orange-400'>1. Introduction</h2>
          <p className='mb-4'>
            At RESZEN8, we are committed to protecting and respecting your privacy. This Privacy Policy explains how we
            collect, use, and safeguard your personal information when you visit our website.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4 text-orange-400'>2. Information We Collect</h2>
          <p className='mb-4'>We may collect and process the following data about you:</p>
          <ul className='list-disc pl-6 mb-4 space-y-2'>
            <li>Information you provide when registering an account</li>
            <li>Details of transactions you carry out through our site</li>
            <li>Information about your visit, including pages viewed and resources accessed</li>
            <li>Information provided when you contact us or report a problem</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4 text-orange-400'>3. How We Use Your Information</h2>
          <p className='mb-4'>We use the information we collect to:</p>
          <ul className='list-disc pl-6 mb-4 space-y-2'>
            <li>Provide and maintain our services</li>
            <li>Process transactions and send related information</li>
            <li>Improve our website and user experience</li>
            <li>Send promotional communications (where you have given consent)</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4 text-orange-400'>4. Data Security</h2>
          <p className='mb-4'>
            We implement appropriate technical and organizational measures to protect your personal data against
            unauthorized or unlawful processing, accidental loss, destruction, or damage.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4 text-orange-400'>5. Your Rights</h2>
          <p className='mb-4'>You have the right to:</p>
          <ul className='list-disc pl-6 mb-4 space-y-2'>
            <li>Access your personal data</li>
            <li>Request correction or deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Request restriction of processing</li>
            <li>Data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4 text-orange-400'>6. Cookies</h2>
          <p className='mb-4'>
            Our website uses cookies to distinguish you from other users. This helps us provide you with a good
            experience when you browse our website and also allows us to improve our site.
          </p>
        </section>

        <section className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4 text-orange-400'>7. Changes to This Policy</h2>
          <p className='mb-4'>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page.
          </p>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-4 text-orange-400'>8. Contact Us</h2>
          <p className='mb-4'>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>Email: support@reszen8.com</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
