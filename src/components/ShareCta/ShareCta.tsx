import React, { useState } from "react";
import { FaShareAlt } from "react-icons/fa";
import "./ShareCtaStyles.scss";
import SocialShare from "../SocialShare/SocialShare";
import { useAuth } from "../../contexts/AuthContext";
import InviteAFriend from "../InviteAFriend/InviteAFriend";

const ShareCta = () => {
  const [show, setShow] = useState(false);
  const { currentUser } = useAuth();

  return (
    <div className='share-panel'>
      <button onClick={() => setShow(!show)} className='share-panel__cta'>
        <FaShareAlt color='orange' />
      </button>
      {show && (
        <div className='share-panel__panel'>
          <SocialShare noMargin />
          {currentUser && <InviteAFriend text />}
        </div>
      )}
    </div>
  );
};

export default ShareCta;
