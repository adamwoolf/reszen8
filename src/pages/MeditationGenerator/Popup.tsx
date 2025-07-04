import React from "react";
import ReactDOM from "react-dom";

import { PracticeTypes } from "../../services/helpers";
import "./PopupStyles.scss";
const Popup = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  if (!show) return null;
  console.log(document.getElementById("modal-root"));

  return ReactDOM.createPortal(
    <div className='popup'>
      {PracticeTypes.map((type) => (
        <div className='popup__list-item' key={type.name}>
          <h4 className='popup__list-title'>{type.name}</h4>
          <p className='popup__list-desc'>{type.description}</p>
        </div>
      ))}

      <button onClick={onClose}>close</button>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Popup;
