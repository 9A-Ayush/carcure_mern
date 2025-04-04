import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import './AuthModal.css';

const ForgotPassword = ({ onBack, onPasswordReset }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      setSuccess('Password reset link has been sent to your email');
      setTimeout(() => {
        onPasswordReset();
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <button className="back-link" onClick={onBack}>
        <FaArrowLeft /> Back to Login
      </button>

      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-subtitle">
        Enter your email to receive a password reset link
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="Email"
            className={error ? 'error' : ''}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
          style={{ backgroundColor: '#ff0000' }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
