import React from "react";
import logo from "../../assets/logoNew.png";
const EnterpriseUserLogin = () => {
  const callForLogin = () => {
    window.parent.postMessage({ type: "LOGIN_USER" }, "*");
  };
  return (
    <div className='enterprise__login'>
      <img src={logo} />
      <button onClick={callForLogin}>INTRANET LOGIN (corporate email)</button>
    </div>
  );
};

export default EnterpriseUserLogin;
