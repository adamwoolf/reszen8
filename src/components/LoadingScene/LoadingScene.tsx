import React from "react";
import "./LoadingSceneStyles.scss";

const ConcentricLoader = () => {
  return (
    <div className='concentric-loader'>
      <div className='loader-text--top'>RESZEN8ing...</div>

      <div className='circle circle1' />
      <div className='circle circle2' />
      <div className='circle circle3' />
      <div className='loader-text'>preparing your meditation</div>
    </div>
  );
};

export default ConcentricLoader;
