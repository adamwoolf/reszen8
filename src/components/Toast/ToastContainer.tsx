import React from "react";
import "./ToastStyles.scss";
import { useSelector } from "react-redux";
import Toast from "./Toast";
const ToastContainer = () => {
  const toasts = useSelector((state) => state.content.toasts);

  return (
    <div className='message__container'>
      {toasts.map((t) => (
        <Toast toast={t} />
      ))}
    </div>
  );
};

export default ToastContainer;
