import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaCar, FaCalendar, FaClock } from 'react-icons/fa';
import { bookAppointment } from '../../services/appointmentService';
import { validateEmail, validatePhone, validateName } from '../../utils/validation';
import AuthModal from '../Auth/AuthModal';
import { toast } from 'react-hot-toast';

const BookingForm = () => {
  const { isAuthenticated, user, setShowAuthModal } = useAuth();
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phoneNumber: '',
    service: '',
    date: '',
    time: '',
    message: '',
    vehicleDetails: {
      make: '',
      model: '',
      year: '',
      registrationNumber: '',
    },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Effect to restore form data after login
  useEffect(() => {
    const submitSavedData = async () => {
      if (isAuthenticated && sessionStorage.getItem('pendingBookingData')) {
        try {
          const savedData = JSON.parse(sessionStorage.getItem('pendingBookingData'));
          setFormData(savedData);
          
          // Add a small delay to ensure auth state is fully updated
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('Submitting saved data after authentication');
          await handleSubmit(null, savedData);
          
          // Clear saved data only after successful submission
          sessionStorage.removeItem('pendingBookingData');
        } catch (error) {
          console.error('Error submitting saved data:', error);
          toast.error('Failed to submit booking. Please try again.');
        }
      }
    };

    submitSavedData();
  }, [isAuthenticated]);

  // Pre-fill user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        email: user.email || prev.email
      }));
    }
  }, [isAuthenticated, user]);

  // Load selected service if any
  useEffect(() => {
    const selectedService = localStorage.getItem('selectedService');
    if (selectedService) {
      const service = JSON.parse(selectedService);
      setFormData(prev => ({
        ...prev,
        service: service.title
      }));
      localStorage.removeItem('selectedService');
    }
  }, []);

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
      setErrors(prev => ({ ...prev, [name]: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (data) => {
    const newErrors = {};

    // Personal Information Validation
    if (!data.customerName) {
      newErrors.customerName = "Full name is required";
    } else if (data.customerName.length < 2) {
      newErrors.customerName = "Name must be at least 2 characters long";
    }

    const emailError = validateEmail(data.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(data.phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;

    // Service Details Validation
    if (!data.service) {
      newErrors.service = "Please select a service";
    }

    // Date and Time Validation
    if (!data.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = "Please select a future date";
      }
    }

    if (!data.time) {
      newErrors.time = "Please select a time";
    }

    // Vehicle Details Validation
    if (!data.vehicleDetails.make) {
      newErrors['vehicleDetails.make'] = "Vehicle make is required";
    }

    if (!data.vehicleDetails.model) {
      newErrors['vehicleDetails.model'] = "Vehicle model is required";
    }

    if (!data.vehicleDetails.year) {
      newErrors['vehicleDetails.year'] = "Vehicle year is required";
    } else {
      const year = parseInt(data.vehicleDetails.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1886 || year > currentYear) {
        newErrors['vehicleDetails.year'] = `Year must be between 1886 and ${currentYear}`;
      }
    }

    if (!data.vehicleDetails.registrationNumber) {
      newErrors['vehicleDetails.registrationNumber'] = "Registration number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, savedData = null) => {
    if (e) e.preventDefault();
    
    const dataToSubmit = savedData || formData;
    
    setLoading(true);
    setErrors({});
    setSuccess(false);

    console.log('Submit attempt - Auth state:', { isAuthenticated, user });
    console.log('Current form data:', dataToSubmit);

    try {
      // Validate form first
      const isValid = validateForm(dataToSubmit);
      console.log('Form validation result:', isValid);
      
      if (!isValid) {
        console.log('Form validation failed. Errors:', errors);
        setLoading(false);
        return;
      }

      console.log('Form validation passed');

      // Check authentication
      if (!isAuthenticated) {
        console.log('User not authenticated, showing auth modal');
        sessionStorage.setItem('pendingBookingData', JSON.stringify(dataToSubmit));
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      console.log('User is authenticated, proceeding with booking');

      // Format and submit data
      const response = await bookAppointment(dataToSubmit);
      console.log('Booking response:', response);

      if (response.success) {
        setSuccess(true);
        sessionStorage.removeItem('pendingBookingData');
        toast.success('Appointment booked successfully!');
        navigate('/dashboard');
      } else {
        if (response.requiresAuth) {
          console.log('Authentication required, showing auth modal');
          sessionStorage.setItem('pendingBookingData', JSON.stringify(dataToSubmit));
          setShowAuthModal(true);
        } else {
          setErrors({ submit: response.error });
          toast.error(response.error || 'Failed to book appointment');
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      setErrors({ submit: error.message || 'Failed to book appointment' });
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="booking-section" id="book">
      <div className="container">
        <h2 className="section-title">Book an Appointment</h2>
        
        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3><FaUser /> Personal Information</h3>
            <div className="form-grid">
              {/* Always show name field for both authenticated and guest users */}
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
                  placeholder="+91 10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  pattern="\+91[0-9]{10}"
                  title="Please enter a valid +91 followed by 10-digit phone number"
                />
                {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3><FaCar /> Vehicle Details</h3>
            <div className="form-grid">
              {/* Vehicle Make */}
              <div className="form-group">
                <label htmlFor="vehicleMake">Vehicle Make</label>
                <input
                  type="text"
                  id="vehicleMake"
                  name="vehicleDetails.make"
                  placeholder="Enter vehicle make"
                  value={formData.vehicleDetails.make}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Allow only letters & spaces
                    handleChange({ target: { name: 'vehicleDetails.make', value } });
                  }}
                />
                {errors['vehicleDetails.make'] && 
                  <span className="error-text">{errors['vehicleDetails.make']}</span>}
              </div>

              {/* Vehicle Model */}
              <div className="form-group">
                <label htmlFor="vehicleModel">Vehicle Model</label>
                <input
                  type="text"
                  id="vehicleModel"
                  name="vehicleDetails.model"
                  placeholder="Enter vehicle model"
                  value={formData.vehicleDetails.model}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''); // Allow letters, numbers, spaces
                    handleChange({ target: { name: 'vehicleDetails.model', value } });
                  }}
                />
                {errors['vehicleDetails.model'] && 
                  <span className="error-text">{errors['vehicleDetails.model']}</span>}
              </div>

              {/* Vehicle Year */}
              <div className="form-group">
                <label htmlFor="vehicleYear">Vehicle Year</label>
                <input
                  type="text"
                  id="vehicleYear"
                  name="vehicleDetails.year"
                  placeholder="Enter vehicle year"
                  value={formData.vehicleDetails.year}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4); // Only numbers, max 4 digits
                    const currentYear = new Date().getFullYear();
                    if (value && (parseInt(value) < 1886 || parseInt(value) > currentYear)) {
                      errors['vehicleDetails.year'] = `Year must be between 1886 and ${currentYear}`;
                    } else {
                      errors['vehicleDetails.year'] = '';
                    }
                    handleChange({ target: { name: 'vehicleDetails.year', value } });
                  }}
                />
                {errors['vehicleDetails.year'] && 
                  <span className="error-text">{errors['vehicleDetails.year']}</span>}
              </div>

              {/* Registration Number */}
              <div className="form-group">
                <label htmlFor="registrationNumber">Registration Number</label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="vehicleDetails.registrationNumber"
                  placeholder="Enter registration number"
                  value={formData.vehicleDetails.registrationNumber}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Allow only uppercase letters & numbers
                    handleChange({ target: { name: 'vehicleDetails.registrationNumber', value } });
                  }}
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
                  required
                >
                  <option value="">Select Service</option>
                  <option value="Regular Maintenance">Regular Maintenance</option>
                  <option value="Engine Repair">Engine Repair</option>
                  <option value="Brake Service">Brake Service</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Tire Service">Tire Service</option>
                  <option value="AC Service">AC Service</option>
                  <option value="Other">Other Service</option>
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
                  required
                />
                {errors.date && <span className="error-text">{errors.date}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="time">Preferred Time</label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Time</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="12:00">12:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
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
