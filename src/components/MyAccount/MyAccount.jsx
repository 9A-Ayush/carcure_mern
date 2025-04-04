import React, { useState, useEffect } from 'react';
import './MyAccount.css';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaHistory,
  FaShoppingBag,
  FaStar,
  FaSignOutAlt,
  FaEdit,
  FaCheck,
  FaTimes,
  FaCalendar,
  FaClock,
  FaBox,
  FaRupeeSign,
  FaSpinner
} from 'react-icons/fa';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MyAccount = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedServices: 0,
    totalOrders: 0,
    savedAmount: 0
  });

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First try to use the user from auth context
      if (authUser) {
        setUserData(authUser);
        setEditedData(authUser);
        setLoading(false);
        return;
      }

      // If not available, try to fetch from API
      const response = await api.getCurrentUser();
      if (response && response.data && response.data.user) {
        const user = response.data.user;
        setUserData(user);
        setEditedData(user);
      } else {
        // Fallback to localStorage if API fails
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUserData(storedUser);
          setEditedData(storedUser);
        } else {
          setError('Could not retrieve user data');
          setTimeout(() => navigate('/'), 2000);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error loading user profile');
      
      // Fallback to localStorage if API fails
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUserData(storedUser);
        setEditedData(storedUser);
      } else {
        setTimeout(() => navigate('/'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch user appointments
  const fetchAppointments = async () => {
    try {
      const response = await api.getUserAppointments();
      if (response && response.data) {
        const userAppointments = response.data.appointments || response.data;
        setAppointments(userAppointments);
        
        // Calculate stats from real appointments
        const completed = userAppointments.filter(app => app.status === 'completed').length;
        setStats(prev => ({
          ...prev,
          totalBookings: userAppointments.length,
          completedServices: completed
        }));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    fetchUserData();
    fetchAppointments();
    // Note: In a real app, you would also fetch orders here
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    // Here you would typically make an API call to update the user profile
    // For now, we'll just update the local state
    setUserData(editedData);
    localStorage.setItem('user', JSON.stringify(editedData));
    setIsEditing(false);
  };

  const handleRating = (bookingId, rating) => {
    console.log(`Rating ${rating} stars for booking ${bookingId}`);
    // Add your rating logic here
  };

  const renderStars = (rating, bookingId) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`star ${index < (rating || 0) ? 'filled' : ''}`}
        onClick={() => handleRating(bookingId, index + 1)}
      />
    ));
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="my-account loading">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-account error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="my-account error">
        <div className="error-message">
          <p>User profile not found. Please log in again.</p>
          <button onClick={() => navigate('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-account">
      <div className="account-header">
        <div className="header-content">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="user-info">
            <h1>Welcome, {userData.name || userData.username || 'User'}!</h1>
            <p>{userData.email}</p>
          </div>
        </div>
        <div className="account-stats">
          <div className="stat-card">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
          <div className="stat-card">
            <h3>{stats.completedServices}</h3>
            <p>Completed Services</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
          <div className="stat-card">
            <h3>₹{stats.savedAmount}</h3>
            <p>Total Savings</p>
          </div>
        </div>
      </div>

      <div className="account-content">
        <div className="content-card">
          <div className="card-header">
            <h2>
              <FaUser className="icon" /> Profile Information
            </h2>
            {!isEditing ? (
              <button className="btn btn-outline" onClick={() => setIsEditing(true)}>
                <FaEdit /> Edit
              </button>
            ) : (
              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setIsEditing(false)}>
                  <FaTimes /> Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveProfile}>
                  <FaCheck /> Save
                </button>
              </div>
            )}
          </div>
          <div className="profile-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="name"
                value={isEditing ? editedData.name || editedData.username || '' : userData.name || userData.username || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={isEditing ? editedData.email || '' : userData.email || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={isEditing ? editedData.phone || '' : userData.phone || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder={isEditing ? 'Enter your phone number' : 'No phone number added'}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={isEditing ? editedData.address || '' : userData.address || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder={isEditing ? 'Enter your address' : 'No address added'}
              />
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2>
              <FaHistory className="icon" /> Recent Bookings
            </h2>
          </div>
          <div className="bookings-list">
            {appointments.length > 0 ? (
              appointments.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.service}</h3>
                    <span className={`status ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p>
                      <FaCalendar /> {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p>
                      <FaClock /> {booking.time || 'Not specified'}
                    </p>
                    <p>
                      <FaRupeeSign /> {booking.price || 'N/A'}
                    </p>
                  </div>
                  {booking.status === 'completed' && !booking.rated && (
                    <div className="rating">
                      <span>Rate your service:</span>
                      <div className="stars">{renderStars(booking.rating, booking._id)}</div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaHistory className="icon" />
                <p>No bookings yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2>
              <FaShoppingBag className="icon" /> Recent Orders
            </h2>
          </div>
          <div className="orders-list">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order._id}</h3>
                    <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                  <div className="order-details">
                    <p>
                      <FaBox /> Items: {order.items ? order.items.join(', ') : 'N/A'}
                    </p>
                    <p>
                      <FaCalendar /> {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                    </p>
                    <p>
                      <FaRupeeSign /> {order.total || 'N/A'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <FaShoppingBag className="icon" />
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="btn btn-outline" onClick={handleLogout} style={{ marginTop: '2rem' }}>
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
};

export default MyAccount;
