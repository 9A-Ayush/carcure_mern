import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Appointments.css';

const Appointments = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments/my-appointments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      // Refresh appointments after status update
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment status');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      // Refresh appointments after cancellation
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  if (loading) {
    return <div className="appointments-loading">Loading appointments...</div>;
  }

  if (error) {
    return <div className="appointments-error">{error}</div>;
  }

  return (
    <div className="appointments-container">
      <h2>My Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
            <div key={appointment._id} className={`appointment-card ${appointment.status}`}>
              <div className="appointment-header">
                <h3>{appointment.serviceType}</h3>
                <span className={`status-badge ${appointment.status}`}>{appointment.status}</span>
              </div>

              <div className="appointment-details">
                <p>
                  <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {appointment.time}
                </p>
                <div className="vehicle-info">
                  <p>
                    <strong>Vehicle:</strong> {appointment.vehicleDetails.model} (
                    {appointment.vehicleDetails.year})
                  </p>
                  <p>
                    <strong>Registration:</strong> {appointment.vehicleDetails.registrationNumber}
                  </p>
                </div>
                {appointment.notes && (
                  <p className="appointment-notes">
                    <strong>Notes:</strong> {appointment.notes}
                  </p>
                )}
              </div>

              <div className="appointment-actions">
                {appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                      className="btn-confirm"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(appointment._id, 'completed')}
                    className="btn-complete"
                  >
                    Mark as Completed
                  </button>
                )}
                {appointment.status === 'completed' && (
                  <button
                    onClick={() => (window.location.href = `/rate/${appointment._id}`)}
                    className="btn-rate"
                  >
                    Rate Service
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
