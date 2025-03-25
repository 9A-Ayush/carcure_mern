import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyAccount.css';
import { FaUser, FaEnvelope, FaCalendarAlt, FaCar, FaHistory, FaStar } from 'react-icons/fa';

const MyAccount = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return (
      <div className="my-account-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="my-account-container">
      <div className="account-header">
        <h1>My Account</h1>
        <p>Welcome back, {user.username}!</p>
      </div>

      <div className="account-content">
        <div className="account-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <h3>{user.username}</h3>
            <p>{user.email}</p>
          </div>
          
          <div className="sidebar-menu">
            <button 
              className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser />
              <span>Profile</span>
            </button>
            
            <button 
              className={`sidebar-item ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              <FaCalendarAlt />
              <span>My Appointments</span>
            </button>
            
            <button 
              className={`sidebar-item ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => setActiveTab('vehicles')}
            >
              <FaCar />
              <span>My Vehicles</span>
            </button>
            
            <button 
              className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory />
              <span>Service History</span>
            </button>
            
            <button 
              className={`sidebar-item ${activeTab === 'ratings' ? 'active' : ''}`}
              onClick={() => setActiveTab('ratings')}
            >
              <FaStar />
              <span>My Ratings</span>
            </button>
            
            <button 
              className="sidebar-item logout"
              onClick={logout}
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        <div className="account-main">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              <div className="profile-info">
                <div className="info-group">
                  <label>Username</label>
                  <p>{user.username}</p>
                </div>
                <div className="info-group">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-group">
                  <label>Member Since</label>
                  <p>{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="profile-actions">
                <button className="primary-button">Edit Profile</button>
                <button className="secondary-button">Change Password</button>
              </div>
            </div>
          )}
          
          {activeTab === 'appointments' && (
            <div className="appointments-section">
              <h2>My Appointments</h2>
              <p className="section-description">
                View and manage your upcoming and past service appointments.
              </p>
              
              <div className="appointments-actions">
                <button 
                  className="primary-button"
                  onClick={() => navigate('/book-appointment')}
                >
                  Book New Appointment
                </button>
              </div>
              
              <div className="appointments-list">
                <p className="empty-state">
                  You don't have any upcoming appointments. 
                  <br />
                  Book a service appointment to get started.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'vehicles' && (
            <div className="vehicles-section">
              <h2>My Vehicles</h2>
              <p className="section-description">
                Manage your registered vehicles for quicker service booking.
              </p>
              
              <div className="vehicles-actions">
                <button className="primary-button">Add New Vehicle</button>
              </div>
              
              <div className="vehicles-list">
                <p className="empty-state">
                  You haven't added any vehicles yet.
                  <br />
                  Add your vehicle details for faster service booking.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="history-section">
              <h2>Service History</h2>
              <p className="section-description">
                View your complete service history and maintenance records.
              </p>
              
              <div className="history-list">
                <p className="empty-state">
                  No service history found.
                  <br />
                  Your service records will appear here after your first service.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'ratings' && (
            <div className="ratings-section">
              <h2>My Ratings & Reviews</h2>
              <p className="section-description">
                View and manage the ratings and reviews you've submitted.
              </p>
              
              <div className="ratings-list">
                <p className="empty-state">
                  You haven't submitted any ratings yet.
                  <br />
                  Rate your service experiences to help us improve.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
