import React, { useState, useEffect } from "react";
import Popup from "../Popup/Popup";
import { useAuth } from "../../contexts/AuthContext";

const ConsentsPopup = () => {
  const [show, setShow] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    // setShow(currentUser && !currentUser?.consents);
  }, [currentUser]);

  return (
    <div>
      <Popup fitContent show={show} onClose={() => setShow(false)}>
        CONSENTS
      </Popup>
    </div>
  );
};

export default ConsentsPopup;
