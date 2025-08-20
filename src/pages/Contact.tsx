import React, { useState, useEffect, isValidElement } from "react";
import "./Contact.css";
import useSendMail from "../hooks/useSendEmail";

const Contact: React.FC = () => {
  const { sendMail, sent, sending } = useSendMail();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    sendMail(
      formData.message,
      `New message from  ${formData.name}: ${formData.email} via RESZEN8 contact form.`,
      "connect@reszen8.com"
    );

    sendMail(
      formData.message,
      `New message from  ${formData.name}: ${formData.email} via RESZEN8 contact form.`,
      "connect@reszen8.com"
    );

    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const getCtaLabel = () => {
    if (sending) return "SENDING MESSAGE";
    if (!sending && !sent) return "SEND MESSAGE";
    if (sent) return "THANKYOU FOR YOUR MESSAGE";
  };

  const isValid = () => formData.email && formData.name && formData.message;

  return (
    <div className='contact-page'>
      <div className='contact-container'>
        <h1>Contact Us</h1>
        <p className='contact-intro'>Have questions or feedback? We'd love to hear from you!</p>

        <form onSubmit={handleSubmit} className='contact-form'>
          <div className='form-group'>
            <label htmlFor='name'>
              Full Name<sup>*</sup>
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              placeholder='John Doe'
            />
          </div>

          <div className='form-group'>
            <label htmlFor='email'>
              Email Address<sup>*</sup>
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              placeholder='your.email@example.com'
            />
          </div>

          <div className='form-group'>
            <label htmlFor='phone'>Phone Number</label>
            <input
              type='tel'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              placeholder='+44 1234 567890'
            />
          </div>

          <div className='form-group'>
            <label htmlFor='message'>
              Your Message<sup>*</sup>
            </label>
            <textarea
              id='message'
              name='message'
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              placeholder='Type your message here...'
            ></textarea>
          </div>
          <button disabled={sending || sent || !isValid()} type='submit' className='submit-btn'>
            {getCtaLabel()}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
