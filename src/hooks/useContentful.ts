import React, { useState, useEffect } from "react";

const useContentful = (fn) => {
  const [content, setContent] = useState([]);

  useEffect(() => {
    fn().then((data) => setContent(data));
  }, []);

  return { content };
};

export default useContentful;
