import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./PasswordResetStyles.scss";
export default function PasswordResetPage() {
  const { resetPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    clearError();

    try {
      setSubmitting(true);
      await resetPassword(email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      setMessage("Failed to send reset email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='password-reset-container'>
      <h2>Reset Your Password</h2>

      {message && <div className='message success'>{message}</div>}
      {error && <div className='message error'>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label>Email address</label>
          <input
            type='email'
            placeholder='Email address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='reset-cta-container'>
          <button type='submit' disabled={submitting || !email}>
            {submitting ? "Sending..." : "Send Reset Email"}
          </button>
          <button className='login-cta' type='button' onClick={() => navigate("/login")}>
            Back to login
          </button>
        </div>
      </form>
    </div>
  );
}
