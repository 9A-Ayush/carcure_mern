import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import './Auth.css';

const ForgotPassword = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process request');
      }

      setSuccess(true);
    } catch (error) {
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal forgot-password-modal">
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="auth-container">
          <div className="auth-info">
            <h2>Reset Password</h2>
            <p>Enter your email to receive password reset instructions</p>
            <div className="auth-image"></div>
          </div>

          <div className="auth-form-container">
            {!success ? (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={error ? 'error' : ''}
                    disabled={loading}
                  />
                  {error && <span className="error-text">{error}</span>}
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <p className="switch-auth">
                  Remember your password?{' '}
                  <button type="button" onClick={onClose}>
                    Login
                  </button>
                </p>
              </form>
            ) : (
              <div className="success-message">
                <h3>Check Your Email</h3>
                <p>
                  We've sent password reset instructions to your email. Please check your inbox and
                  follow the instructions.
                </p>
                <button className="submit-btn" onClick={onClose}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
