import React, { useState } from "react";
import "./InviteAFriendStyles.scss";
import useSendMail from "../../hooks/useSendEmail";
import { useAuth } from "../../contexts/AuthContext";
import ThreeDotsLoader from "../ThreeDotsLoads";

const InviteAFriend = ({ text }: { text?: boolean }) => {
  const { sendMail, sent, sending } = useSendMail();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { currentUser } = useAuth();

  const handleSend = () => {
    const body = `<p>Hello ${name},</p>
<p>We’re excited to welcome you into the RESZEN8 community!</p>
    <p>You’ve been personally invited by ${currentUser?.firstName} ${currentUser?.surName}, who is one of our members, to experience everything RESZEN8 has to offer. To get started, simply use the code below when signing up:</p>
    <p>Your Code: <b>${currentUser.referralCode}</b></p>
    <p>Join us today at <a href="https://reszen8.com" >www.reszen8.com</a></p>
    <p></p>Not ready to sign up right away? No worries, you can still explore RESZEN8 with a 14-day totally free trial. And when you’re ready to become a full member, just enter your code during sign-up.  
    <p>We can’t wait to have you on board and see all the amazing things you’ll do as part of the RESZEN8 family.</p>
    <p>See you inside,</p>
    <p>The RESZEN8 Team</p>
    <small>You’re receiving this invite because a RESZEN8 member, ${currentUser?.firstName} ${currentUser?.surName}, thought you’d enjoy RESZEN8 and asked us to send it on their behalf. We don’t store your email address unless you decide to sign up. For details on how we handle data, please see our <a href="https://reszen8.com/privacy-policy" >Privacy Policy</a></small>`;

    sendMail(body, `Your RESZEN8 referral code from ${currentUser?.firstName} ${currentUser?.surName}`, email);
  };
  return (
    <div className='invite'>
      {text && (
        <div className='invite__text'>
          {" "}
          <p>Invite a friend to sign up and win credits.</p>
          <p>Just enter their email address, click 'Invite' and we'll do the rest.</p>
        </div>
      )}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Friend's name" />

      <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Friend's email" />
      <button style={{ display: "flex" }} onClick={handleSend}>
        Invite {sending && <ThreeDotsLoader />}
      </button>
    </div>
  );
};

export default InviteAFriend;
