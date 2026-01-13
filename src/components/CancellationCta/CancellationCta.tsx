import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { cancelSubscription } from "../../store/apiUtils";
import useSendMail from "../../hooks/useSendEmail";
import ThreeDotsLoader from "../ThreeDotsLoads";
import { getMeditationItems, getUser } from "../../store/apiUtils";

const CancellationCta = () => {
  const { currentUser, signOutRedirect } = useAuth();
  const { sendMail } = useSendMail();
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState("");
  const [label, setLabel] = useState("Cancel Subscription");

  const subject = "Membership Cancellation: We’re sad to see you go 💙";
  const html = `<p>Hi ${currentUser?.firstName} ${currentUser?.surName},</p>
<p>We’re sorry to see you leave RESZEN8! Your membership will stay active until the end of your current billing period, and then it will automatically end. You won’t be charged again after that.
  Once it ends, your member-only features will no longer be available, but you’ll still keep your basic account. </p>
  <p>If you’ve signed up for updates and marketing emails, you’ll continue to receive those. If you’d prefer to fully delete your account, you can do that anytime in the My Account area.</p>

  <p>Thank you for being part of the RESZEN8 community — we’d love to welcome you back anytime!</p>

  <p>With gratitude,</p>
  <p>The RESZEN8 Team</p>`;

  const handleCancelMembership = async () => {
    setWaiting(true);

    await cancelSubscription(currentUser.uid);
    console.log("CANCELLED");
    sendMail(html, subject, currentUser.email);
    setLabel("Subscription Cancelled");
    await getUser(currentUser?.uid);

    setWaiting(false);
  };

  if (currentUser?.subscription?.cancelAtPeriodEnd) return null;
  return (
    <button
      disabled={waiting || label === "Subscription Cancelled"}
      style={{ display: "flex" }}
      onClick={handleCancelMembership}
    >
      {label} {waiting && <ThreeDotsLoader />}
    </button>
  );
};

export default CancellationCta;
