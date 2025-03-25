import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookAppointment } from '../../services/appointmentService';
import './AppointmentForm.css';

const AppointmentForm = ({ onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phoneNumber: '',
    service: '',
    date: '',
    time: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Prefill form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prevState) => ({
        ...prevState,
        customerName: user.username || '',
        email: user.email || '',
        phoneNumber: user.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.customerName) return 'Name is required';
    if (!formData.email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Email is invalid';
    if (!formData.phoneNumber) return 'Phone number is required';
    if (!formData.service) return 'Service is required';
    if (!formData.date) return 'Date is required';
    if (!formData.time) return 'Time is required';

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await bookAppointment(formData);

      if (result.success) {
        setSuccess('Appointment booked successfully! We will contact you to confirm.');
        setFormData({
          customerName: isAuthenticated ? user.username || '' : '',
          email: isAuthenticated ? user.email || '' : '',
          phoneNumber: isAuthenticated ? user.phone || '' : '',
          service: '',
          date: '',
          time: '',
          message: '',
        });

        if (onSuccess) {
          onSuccess(result.data.appointment);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error booking appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    'Oil Change',
    'Brake Service',
    'Tire Rotation',
    'Engine Tune-Up',
    'Battery Replacement',
    'Air Conditioning Service',
    'Transmission Service',
    'Wheel Alignment',
    'Suspension Repair',
    'Exhaust System Repair',
    'Diagnostic Service',
    'Full Vehicle Inspection',
  ];

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
      const period = hour < 12 ? 'AM' : 'PM';

      slots.push(`${hourFormatted}:00 ${period}`);
      if (hour !== 17) {
        // Don't add 5:30 PM
        slots.push(`${hourFormatted}:30 ${period}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="appointment-form-container">
      <h2>Book Your Service Appointment</h2>

      {error && (
        <div className="appointment-error-message">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="appointment-success-message">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-group">
          <label htmlFor="customerName">Full Name</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="service">Service Type</label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
          >
            <option value="">Select a service</option>
            {services.map((service, index) => (
              <option key={index} value={service}>
                {service}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
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
          </div>

          <div className="form-group">
            <label htmlFor="time">Preferred Time</label>
            <select id="time" name="time" value={formData.time} onChange={handleChange} required>
              <option value="">Select a time</option>
              {timeSlots.map((time, index) => (
                <option key={index} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message">Additional Information (Optional)</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us more about your service needs or any specific issues with your vehicle"
            rows="4"
          ></textarea>
        </div>

        <button type="submit" className="book-appointment-btn" disabled={loading}>
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;
