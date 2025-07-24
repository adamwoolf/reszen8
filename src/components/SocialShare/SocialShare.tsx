import React from "react";
import {
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  FacebookIcon,
  FacebookShareButton,
  XIcon,
} from "react-share";
import "./SocialShareStyles.scss";
const SocialShare = ({ title, quote }: { title: string; quote: string }) => {
  return (
    <div className='share'>
      <div className='share-divider' />
      <small>Share this page on your social media</small>
      <br></br>
      <TwitterShareButton
        className='share-button'
        url={window.location.href}
        children={<XIcon round={true} className='share-icon' />}
        title={title}
      />
      <LinkedinShareButton
        className='share-button'
        url={window.location.href}
        children={<LinkedinIcon round={true} className='share-icon' />}
        title={title}
        summary='Bespoke Wellbeing and Meditation solutions'
        source='reszen8.com'
      />
      <FacebookShareButton
        className='share-button'
        url={window.location.href}
        children={<FacebookIcon round={true} className='share-icon' />}
        title={title}
        hashtag='#meditation'
      />
    </div>
  );
};

export default SocialShare;
