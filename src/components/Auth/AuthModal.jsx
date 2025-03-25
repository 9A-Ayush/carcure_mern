import React, { useState, useEffect } from 'react';
import './Auth.css';
import { FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ForgotPassword from './ForgotPassword';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { login, signup, error: authError, loading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [loginAttempt, setLoginAttempt] = useState(0);
  const [serverError, setServerError] = useState('');
  const [connectionError, setConnectionError] = useState(false);

  // Reset form errors when switching modes
  useEffect(() => {
    setFormErrors({});
    setServerError('');
    setConnectionError(false);
  }, [isLoginMode]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form data and errors when modal closes
      setTimeout(() => {
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setFormErrors({});
        setServerError('');
        setConnectionError(false);
      }, 300);
    }
  }, [isOpen]);

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!isLoginMode && !formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isLoginMode && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!isLoginMode && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    setServerError('');
    setConnectionError(false);

    if (Object.keys(errors).length === 0) {
      try {
        if (isLoginMode) {
          setLoginAttempt((prev) => prev + 1);
          await login({
            username: formData.username,
            password: formData.password,
          });
          onClose();
          navigate('/my-account');
        } else {
          await signup({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          });
          onClose();
          navigate('/my-account');
        }
      } catch (error) {
        console.error('Auth error:', error);
        // Check if it's a network error
        if ((error.message && error.message.includes('Network Error')) || !navigator.onLine) {
          setConnectionError(true);
          setServerError('Login failed. Please check your connection and try again.');
        } else if (error.message) {
          setServerError(error.message);
        } else if (error.errors) {
          // Handle field-specific errors
          const fieldErrors = {};
          Object.entries(error.errors).forEach(([field, message]) => {
            fieldErrors[field] = message;
          });
          setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
        } else {
          setServerError(
            isLoginMode
              ? 'Login failed. Please check your credentials and try again.'
              : 'Signup failed. Please try again later.'
          );
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    // Clear server error when user makes changes
    if (serverError) {
      setServerError('');
      setConnectionError(false);
    }
  };

  if (!isOpen) return null;

  if (showForgotPassword) {
    return (
      <ForgotPassword
        isOpen={true}
        onClose={() => {
          setShowForgotPassword(false);
          setFormErrors({});
          setServerError('');
          setConnectionError(false);
        }}
      />
    );
  }

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-modal" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="auth-container">
          <div className="auth-info">
            <h2>{isLoginMode ? 'Welcome Back!' : 'Join Us!'}</h2>
            <p>
              {isLoginMode
                ? 'Access your account and manage your services'
                : 'Create an account to get started'}
            </p>
            <div className="auth-image"></div>
          </div>

          <div className="auth-form-container">
            <h3>{isLoginMode ? 'Login' : 'Create Account'}</h3>

            {connectionError && (
              <div className="server-error connection-error">
                <FaExclamationCircle />
                <span>Login failed. Please check your connection and try again.</span>
              </div>
            )}

            {serverError && !connectionError && (
              <div className="server-error">
                <FaExclamationCircle />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={formErrors.username ? 'error' : ''}
                />
                {formErrors.username && <span className="error-text">{formErrors.username}</span>}
              </div>

              {!isLoginMode && (
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>
              )}

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={formErrors.password ? 'error' : ''}
                />
                {formErrors.password && <span className="error-text">{formErrors.password}</span>}
              </div>

              {!isLoginMode && (
                <div className="form-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={formErrors.confirmPassword ? 'error' : ''}
                  />
                  {formErrors.confirmPassword && (
                    <span className="error-text">{formErrors.confirmPassword}</span>
                  )}
                </div>
              )}

              {(authError || formErrors.general) && (
                <div className="error-message">{authError || formErrors.general}</div>
              )}

              {isLoginMode && (
                <div className="form-extra">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Please wait...' : isLoginMode ? 'Login' : 'Create Account'}
              </button>
            </form>

            <p className="switch-auth">
              {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                  });
                }}
              >
                {isLoginMode ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
