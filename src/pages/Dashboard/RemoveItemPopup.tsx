import React from "react";
import Popup from "../../components/Popup/Popup";

const RemoveItemPopup = ({ show, onClose, handleRemoveItem, item }) => {
  return (
    <Popup showClose={false} fitContent show={show} onClose={onClose}>
      <>
        <h3>Remove from your Journey</h3>
        <p>
          "{item?.title}" will be removed from your Journey, but still be available in the Collections area of the
          Meditation Library.
        </p>
        <button onClick={onClose} className='dashboard-button'>
          Cancel
        </button>
        <button
          onClick={() => {
            handleRemoveItem(item, "collections");
            onClose(false);
          }}
          className='dashboard-button'
        >
          Okay
        </button>
      </>
    </Popup>
  );
};

export default RemoveItemPopup;
