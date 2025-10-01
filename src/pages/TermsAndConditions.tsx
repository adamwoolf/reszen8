import React from "react";
import useContentful from "../hooks/useContentful";
import { getTsAndCs } from "../contentful";
import { marked } from "marked";
const TermsAndConditions: React.FC = () => {
  const content = useContentful(getTsAndCs)?.content?.items?.[0]?.fields?.text;

  return (
    <div className='page-container max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6 text-orange-500'>Terms and Conditions</h1>
      {content && <div dangerouslySetInnerHTML={{ __html: marked(content) }} />}
    </div>
  );
};

export default TermsAndConditions;
