import React, { useState, useEffect } from 'react';
import './Rating.css';
import { FaStar, FaTimes, FaUser, FaCheck } from 'react-icons/fa';
import { submitRating } from '../../services/ratingService';

const Rating = ({ isOpen, onClose, isAuthenticated, onAuthRequired, appointmentId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication when the component opens
    if (isOpen && !isAuthenticated) {
      setShowAuthPrompt(true);
    } else {
      setShowAuthPrompt(false);
    }
    
    // Reset form when opened
    if (isOpen) {
      setRating(0);
      setFeedback('');
      setSubmitted(false);
      setError(null);
    }

    // Validate appointmentId
    if (isOpen && !appointmentId) {
      console.error('No appointmentId provided');
      setError('Invalid appointment. Please try again.');
    }
  }, [isOpen, isAuthenticated, appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate appointmentId
    if (!appointmentId) {
      console.error('Missing appointmentId:', appointmentId);
      setError('Invalid appointment. Please try again.');
      return;
    }

    console.log('Current rating value:', rating); // Debug log
    
    // Validate rating before submission
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create rating data object with proper validation
      const ratingValue = parseInt(rating);
      const ratingData = {
        appointmentId: appointmentId.toString(), // Ensure appointmentId is a string
        rating: ratingValue,
        comment: feedback,
        serviceQuality: ratingValue,
        customerService: ratingValue,
        timelyService: ratingValue
      };

      console.log('Submitting rating data:', ratingData); // Debug log
      
      // Submit rating to backend
      const response = await submitRating(ratingData);
      
      if (response.success) {
        console.log('Rating submitted successfully:', response.data);
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setRating(0);
          setFeedback('');
        }, 2000);
      } else {
        console.log('Rating submission failed:', response.error); // Debug log
        setError(response.error || 'Failed to submit rating. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthRedirect = () => {
    onClose();
    onAuthRequired();
  };

  if (!isOpen) return null;

  return (
    <div className="rating-overlay">
      <div className="rating-modal">
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {showAuthPrompt ? (
          <div className="auth-prompt">
            <FaUser className="auth-icon" />
            <h2>Sign in Required</h2>
            <p>Please sign in or create an account to submit a rating.</p>
            <button className="submit-btn" onClick={handleAuthRedirect}>
              Sign in / Sign up
            </button>
          </div>
        ) : !submitted ? (
          <>
            <h2>Rate Our Service</h2>
            <p>How would you rate your experience with us?</p>

            <div className="stars-container">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      name="rating"
                      value={ratingValue}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        console.log('Selected rating:', value); // Debug log
                        setRating(value);
                      }}
                      checked={rating === ratingValue}
                    />
                    <FaStar
                      className="star"
                      color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                      size={40}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                );
              })}
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <textarea
                  placeholder="Tell us about your experience (optional)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="submit-btn" 
                disabled={rating === 0 || loading}
              >
                {loading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          </>
        ) : (
          <div className="success-message">
            <FaCheck className="success-icon" />
            <h2>Thank You!</h2>
            <p>Your feedback has been submitted successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rating;
