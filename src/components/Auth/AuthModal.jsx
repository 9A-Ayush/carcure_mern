import React, { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import ForgotPassword from './ForgotPassword';
import { useAuth } from '../../context/AuthContext';
import './AuthModal.css';
import { toast } from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If not open, don't render anything
  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!isLoginMode && !formData.name) {
      newErrors.name = 'Name is required';
    } else if (!isLoginMode && formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setError(Object.values(newErrors).join('\n') || '');
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      let result;
      if (isLoginMode) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        toast.success('Authentication successful');
        // Reset form data
        setFormData({
          email: '',
          password: '',
          name: '',
        });
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal-container" onClick={e => e.stopPropagation()}>
          <ForgotPassword 
            onBack={() => setShowForgotPassword(false)}
            onPasswordReset={() => {
              setShowForgotPassword(false);
              setIsLoginMode(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="auth-modal-left">
          <h1>Welcome</h1>
          <p>
            Experience premium car service and repair with our expert team.
            Your satisfaction is our priority. Get started today for quality
            maintenance and repairs.
          </p>
        </div>

        <div className="auth-modal-right">
          <h2>{isLoginMode ? 'Login' : 'Create Account'}</h2>
          <p className="auth-subtitle">
            {isLoginMode
              ? 'Welcome back! Please login to your account'
              : 'Create your account. It\'s free and only takes a minute'}
          </p>

          {error && (
            <div className="error-message server-error">
              <FaExclamationCircle /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLoginMode && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={error ? 'error' : ''}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={error ? 'error' : ''}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={error ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {isLoginMode && (
              <div className="forgot-password">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isLoginMode ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setFormData({
                  email: '',
                  password: '',
                  name: ''
                });
                setError('');
              }}
            >
              {isLoginMode ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
