import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import './EmailVerification.css';

function EmailSent() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="email-verification-container">
      <div className="verification-card">
        <div className="verification-icon">
          <FaCheckCircle className="success-icon" />
        </div>

        <h1 className="verification-title">Check your email</h1>

        <p className="verification-message">
          {email ? (
            <>A verification link has been sent to <strong>{email}</strong>. Please check your inbox (and spam folder) and click the link to verify your account.</>
          ) : (
            <>A verification link has been sent to your email address. Please check your inbox (and spam folder) and click the link to verify your account.</>
          )}
        </p>

        <div className="success-content">
          <p className="redirect-info">
            <FaEnvelope className="envelope-icon" /> You can return to sign in after verifying your email.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
          <button className="btn btn-primary" onClick={() => navigate('/signin')}>Go to Sign In</button>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

export default EmailSent;
