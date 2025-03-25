import React, { useState } from 'react';
import './BookingForm.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaCar, FaCalendar, FaClock } from 'react-icons/fa';
import { bookAppointment } from '../../services/appointmentService';
import { validateEmail, validatePhone, validateName } from '../../utils/validation';
import AuthModal from '../Auth/AuthModal';  // Add this import

const BookingForm = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phoneNumber: '',
    service: '',
    date: '',
    time: '',
    message: '',
    vehicleDetails: {
      model: '',
      year: '',
      registrationNumber: '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vehicleDetails.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        vehicleDetails: {
          ...prev.vehicleDetails,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear specific field error when user types
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information Validation
    const nameError = validateName(formData.customerName);
    if (nameError) newErrors.customerName = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;

    // Service Details Validation
    if (!formData.service) {
      newErrors.service = "Please select a service";
    }

    // Date and Time Validation
    if (!formData.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate < today) {
        newErrors.date = "Please select a future date";
      }
    }

    if (!formData.time) {
      newErrors.time = "Please select a time";
    }

    // Vehicle Details Validation
    if (!formData.vehicleDetails.model) {
      newErrors['vehicleDetails.model'] = "Vehicle model is required";
    }
    if (!formData.vehicleDetails.year) {
      newErrors['vehicleDetails.year'] = "Vehicle year is required";
    }
    if (!formData.vehicleDetails.registrationNumber) {
      newErrors['vehicleDetails.registrationNumber'] = "Registration number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);
      
      const appointmentData = {
        customerName: formData.customerName || 'Guest User',
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        service: formData.service,
        date: appointmentDate,
        time: formData.time,
        message: formData.message || '',
        vehicleDetails: {
          model: formData.vehicleDetails.model,
          year: formData.vehicleDetails.year,
          registrationNumber: formData.vehicleDetails.registrationNumber
        }
      };

      const result = await bookAppointment(appointmentData);
      
      if (result.success) {
        alert('Appointment booked successfully!');
        navigate('/my-appointments');
      } else {
        setErrors({ submit: result.error || 'Failed to book appointment. Please try again.' });
      }
    } catch (error) {
      console.error('Booking failed:', error);
      setErrors({ submit: error.message || 'Failed to submit booking. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="booking-section" id="book">
      <div className="container">
        <h2 className="section-title">Book an Appointment</h2>
        {!isAuthenticated && (
          <div className="login-prompt">
            Please <button 
              onClick={() => setShowAuthModal(true)} 
              className="login-link"
              style={{ background: 'none', border: 'none', color: '#0056b3', textDecoration: 'underline', cursor: 'pointer' }}
            >
              login or signup
            </button> to book an appointment
          </div>
        )}

        {/* Add AuthModal component */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />

        <form className="booking-form" onSubmit={handleSubmit}>
          {errors.submit && <div className="error-message">{errors.submit}</div>}
          
          <div className="form-section">
            <h3><FaUser /> Personal Information</h3>
            <div className="form-grid">
              {!isAuthenticated && (
                <div className="form-group">
                  <label htmlFor="customerName">Full Name</label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    placeholder="Enter your full name"
                    value={formData.customerName}
                    onChange={handleChange}
                  />
                  {errors.customerName && <span className="error-text">{errors.customerName}</span>}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><FaCar /> Vehicle Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="vehicleModel">Vehicle Model</label>
                <input
                  type="text"
                  id="vehicleModel"
                  name="vehicleDetails.model"
                  placeholder="Enter vehicle model"
                  value={formData.vehicleDetails.model}
                  onChange={handleChange}
                />
                {errors['vehicleDetails.model'] && 
                  <span className="error-text">{errors['vehicleDetails.model']}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="vehicleYear">Vehicle Year</label>
                <input
                  type="text"
                  id="vehicleYear"
                  name="vehicleDetails.year"
                  placeholder="Enter vehicle year"
                  value={formData.vehicleDetails.year}
                  onChange={handleChange}
                />
                {errors['vehicleDetails.year'] && 
                  <span className="error-text">{errors['vehicleDetails.year']}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="registrationNumber">Registration Number</label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="vehicleDetails.registrationNumber"
                  placeholder="Enter registration number"
                  value={formData.vehicleDetails.registrationNumber}
                  onChange={handleChange}
                />
                {errors['vehicleDetails.registrationNumber'] && 
                  <span className="error-text">{errors['vehicleDetails.registrationNumber']}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><FaCalendar /> Appointment Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="service">Service Type</label>
                <select 
                  id="service"
                  name="service" 
                  value={formData.service} 
                  onChange={handleChange}
                >
                  <option value="">Select Service</option>
                  <option value="general">General Service</option>
                  <option value="repair">Repair</option>
                  <option value="inspection">Inspection</option>
                </select>
                {errors.service && <span className="error-text">{errors.service}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="date">Preferred Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <span className="error-text">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="time">Preferred Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                />
                {errors.time && <span className="error-text">{errors.time}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group full-width">
              <label htmlFor="message">Additional Notes (Optional)</label>
              <textarea
                id="message"
                name="message"
                placeholder="Any specific requirements or concerns?"
                value={formData.message}
                onChange={handleChange}
                rows="4"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default BookingForm;
