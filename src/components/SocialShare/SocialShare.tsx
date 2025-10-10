import React from "react";
import {
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  FacebookIcon,
  FacebookShareButton,
  XIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import { FaTiktok, FaYoutube, FaInstagram } from "react-icons/fa";
import "./SocialShareStyles.scss";
const SocialShare = ({
  header,
  title,
  quote,
  url,
  noMargin,
}: {
  header?: string;
  title: string;
  quote: string;
  url?: string;
  noMargin?: boolean;
}) => {
  return (
    <div className={!noMargin ? "share" : "share share--no-margin"}>
      <div className='share-divider' />
      <small>{header || "Share this page"}</small>
      <br></br>
      <TwitterShareButton
        className='share-button'
        url={url || window.location.href}
        children={<XIcon round={true} className='share-icon' />}
        title={title}
      />
      <LinkedinShareButton
        className='share-button'
        url={url || window.location.href}
        children={<LinkedinIcon round={true} className='share-icon' />}
        title={title}
        summary='Bespoke Wellbeing and Meditation solutions'
        source='reszen8.com'
      />
      <FacebookShareButton
        className='share-button'
        url={url || window.location.href}
        children={<FacebookIcon round={true} className='share-icon' />}
        title={title}
        hashtag='#meditation'
      />
      <WhatsappShareButton
        className='share-button'
        url={url || window.location.href}
        children={<WhatsappIcon round={true} className='share-icon' />}
        title={title}
      />
      {/* <div>
        <small className='share-intro'> follow us on</small>
        <div className='share-links'>
          <a target='_blank' href='https://www.youtube.com/@RESZEN8'>
            <FaYoutube size={33} color='orange' />
          </a>
          <a target='_blank' href=''>
            <FaInstagram size={33} color='orange' />
          </a>
          <a target='_blank' href=''>
            <FaTiktok size={33} color='orange' />
          </a>
        </div>
      </div> */}
    </div>
  );
};

export default SocialShare;
