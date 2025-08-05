import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import "./PopupStyles.scss";
const Popup = ({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) => {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  if (!show) return null;
  const rootElement = document.getElementById("modal-root");
  if (!rootElement) return null;
  return ReactDOM.createPortal(
    <>
      <div className='popup'>
        <div className='popup__content-container'>{children}</div>
        <button className='popup__close' onClick={onClose}>
          close
        </button>
      </div>
      <div className='popup__backdrop' />
    </>,
    rootElement
  );
};

export default Popup;
