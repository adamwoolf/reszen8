import React, { useState, useEffect } from "react";
import { getTsAndCs } from "../contentful";
import { marked } from "marked";
const TermsAndConditions: React.FC = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    getTsAndCs().then((data) => setContent(data?.text));
  }, []);
  return (
    <div className='page-container max-w-4xl mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6 text-orange-500'>Terms and Conditions</h1>
      {content && <div dangerouslySetInnerHTML={{ __html: marked(content) }} />}
    </div>
  );
};

export default TermsAndConditions;
