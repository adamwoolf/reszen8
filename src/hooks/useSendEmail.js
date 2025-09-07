import { useState } from "react";
import axios from "axios";
import { AWS_DB_ENDPOINT } from "../constants";

const useSendEmail = () => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const endPoint = `${AWS_DB_ENDPOINT}/sendMail`;
  const sendMail = async (html, subject, recipient) => {
    setSent(false);
    setSending(true);

    await fetch(endPoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipient,
        cc: "",
        subject,
        html,
      }),
    })
      .then((res) => res.text())
      .then(() => {
        setSent(true);
        setSending(false);
        setTimeout(() => setSent(false), 5000);
      })
      .catch(console.error);
  };

  return { sendMail, sent, sending };
};

export default useSendEmail;
