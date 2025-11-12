import { useState } from "react";
import { sendEmailSES } from "../store/apiUtils";

const useSendEmail = () => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const sendMail = async (html, subject, recipient) => {
    console.log(recipient, subject, html);
    setSent(false);
    setSending(true);

    await sendEmailSES({ email: recipient, subject, message: html });
    setSent(true);
    setSending(false);
    setTimeout(() => setSent(false), 5000);
  };

  return { sendMail, sent, sending };
};

export default useSendEmail;
