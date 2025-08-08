import React from "react";
import "./LiquidWrapperStyles.scss";
const LiquidWrapper = ({ children }) => {
  return (
    <div className='liquid-glass'>
      <div className='liquid-glass__content'>{children}</div>
    </div>
  );
};

export default LiquidWrapper;
