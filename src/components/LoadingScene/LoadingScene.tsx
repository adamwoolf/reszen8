import React from "react";
import "./LoadingSceneStyles.scss";

const LoadingScene = () => {
  return (
    <div className='concentric-loader'>
      {/* <div className='loader-text--top'>RESZEN8ing...</div> */}
      {/* <div className='loader-text--top'>preparing your meditation</div> */}

      <div className='circle circle1' />
      <div className='circle circle2' />
      <div className='circle circle3' />
    </div>
  );
};

export default LoadingScene;
