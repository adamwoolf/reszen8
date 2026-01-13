import React from "react";
import "./LocationBlockedStyles.scss";
import { LinkedinIcon, FacebookIcon, XIcon, WhatsappIcon, PinterestIcon, TelegramIcon } from "react-share";
import { FaTiktok, FaYoutube, FaInstagram } from "react-icons/fa";
import logo from "../../assets/logoNew.png";
const LocationBlocked = () => {
  return (
    <div className='blocked'>
      <img src={logo} className='blocked__logo' />
      <h1>RESZEN8</h1>

      <p>We're sorry, but RESZEN8 is currently only available to users in the UK.</p>
      <p>
        We are working to bring our content to the rest of the world, but in the meantime you can still enjoy our
        insightful posts at X and Instagram
      </p>
      <div className='blocked__links'>
        <a href='https://www.instagram.com/reszen8/' target='_blank'>
          {" "}
          <FaInstagram size={43} />
        </a>
        <a href='https://x.com/reszen8' target='_blank'>
          {" "}
          <XIcon />
        </a>
      </div>
    </div>
  );
};

export default LocationBlocked;
