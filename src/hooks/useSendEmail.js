import { useState } from "react";
import axios from "axios";

const useSendEmail = () => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const endPoint = "https://us-central1-reszen8-1d832.cloudfunctions.net/sendMail";
  // const endPoint = "http://127.0.0.1:5001/reszen8-1d832/us-central1/sendMail";
  const sendMail = async (html, subject, recipient) => {
    setSent(false);
    setSending(true);

    fetch(endPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html,
        subject,
        to: recipient,
        cc: "adam@webspinner.eu",
      }),
    })
      .then((res) => res.text())
      .then(console.log)
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
