import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaTools, FaSpinner, FaCheck, FaTimes, FaExclamationTriangle, FaStar } from 'react-icons/fa';
import api from '../../services/api';
import './MyAppointments.css';
import { useAuth } from '../../context/AuthContext';

const MyAppointments = ({ onRateClick }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await api.getUserAppointments();
        setAppointments(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load your appointments. Please try again later.');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending"><FaExclamationTriangle /> Pending</span>;
      case 'confirmed':
        return <span className="status-badge confirmed"><FaCheck /> Confirmed</span>;
      case 'completed':
        return <span className="status-badge completed"><FaCheck /> Completed</span>;
      case 'cancelled':
        return <span className="status-badge cancelled"><FaTimes /> Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRateService = (appointmentId) => {
    onRateClick(appointmentId);
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.cancelAppointment(id);
        // Update the appointments list
        setAppointments(appointments.map(app => 
          app._id === id ? { ...app, status: 'cancelled' } : app
        ));
      } catch (err) {
        console.error('Error cancelling appointment:', err);
        alert('Failed to cancel appointment. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="my-appointments-container loading">
        <FaSpinner className="spinner" />
        <p>Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-appointments-container error">
        <FaExclamationTriangle />
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="my-appointments-container">
      <div className="page-header">
        <h1><FaCalendarAlt /> My Appointments</h1>
        <p>Manage your service appointments</p>
      </div>

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <FaCalendarAlt className="icon" />
          <h2>No appointments found</h2>
          <p>You don't have any service appointments scheduled yet.</p>
          <button onClick={() => navigate('/#book')} className="book-now-btn">Book a Service Now</button>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment._id} className={`appointment-card ${appointment.status}`}>
              <div className="appointment-header">
                <h3>{appointment.service}</h3>
                {getStatusBadge(appointment.status)}
              </div>
              
              <div className="appointment-details">
                <p><FaCalendarAlt /> <strong>Date:</strong> {formatDate(appointment.date)}</p>
                <p><FaClock /> <strong>Time:</strong> {appointment.time}</p>
                <p><FaTools /> <strong>Service:</strong> {appointment.service}</p>
                {appointment.message && (
                  <p className="appointment-message">
                    <strong>Notes:</strong> {appointment.message}
                  </p>
                )}
              </div>
              
              <div className="appointment-actions">
                {appointment.status === 'pending' && (
                  <button 
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                )}
                
                {appointment.status === 'completed' && !appointment.hasRating && (
                  <button 
                    onClick={() => handleRateService(appointment._id)}
                    className="rate-btn"
                  >
                    <FaStar /> Rate Service
                  </button>
                )}
                
                {appointment.status === 'completed' && appointment.hasRating && (
                  <span className="rated-badge"><FaStar /> Rated</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
