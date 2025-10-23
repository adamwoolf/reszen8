import React from "react";
import { LinkedinIcon, FacebookIcon, XIcon, WhatsappIcon, PinterestIcon, TelegramIcon } from "react-share";
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
  const shareUrl = url || window.location.href;
  const shareTitle = title || "Bespoke wellbeing & meditation solutions";
  return (
    <div className={!noMargin ? "share" : "share share--no-margin"}>
      <div className='share-divider' />
      <small>{header || "Share this page"}</small>

      <div className='share-grid'>
        <a
          aria-label='share-to-facebook'
          className='share-link'
          target='_blank'
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        >
          <FacebookIcon round={true} className='share-icon' />{" "}
        </a>
        <a
          aria-label='share-to-twitter'
          className='share-link'
          target='_blank'
          href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
        >
          <XIcon round={true} className='share-icon' />
        </a>
        <a
          aria-label='share-to-pinterest'
          className='share-link'
          target='_blank'
          href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
            shareUrl
          )}&description=${encodeURIComponent(shareTitle)}`}
        >
          <PinterestIcon round={true} className='share-icon' />
        </a>

        <a className='share-link' target='_blank' href={` ⁠https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`}>
          <TelegramIcon className='share-icon' round={true} />
        </a>
        <a
          aria-label='share-to-linkedin'
          className='share-link'
          target='_blank'
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
        >
          <LinkedinIcon className='share-icon' round={true} />
        </a>
        <a
          aria-label='share-to-whatsapp'
          className='share-link'
          target='_blank'
          href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
        >
          <WhatsappIcon className='share-icon' round={true} />
        </a>
      </div>
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
