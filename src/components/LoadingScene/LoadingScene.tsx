import React from "react";
import "./LoadingSceneStyles.scss";
import logo from "../../assets/logoNew.png";

const LoadingScene = ({ slow = false }: { slow?: boolean }) => {
  return (
    <div className='concentric-loader'>
      {/* <div className='loader-text--top'>RESZEN8ing...</div> */}
      {/* <div className='loader-text--top'>preparing your meditation</div> */}

      <div className='circle circle1' />
      <div className='circle circle2' />
      <div className='circle circle3' />
      <img className={slow ? "circle__logo circle__logo--long" : "circle__logo"} src={logo} />
    </div>
  );
};

export default LoadingScene;
