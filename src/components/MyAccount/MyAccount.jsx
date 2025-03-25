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
} from 'react-icons/fa';

const MyAccount = ({ onLogout }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/');
      return;
    }
    setUserData(user);
    setEditedData(user);
  }, [navigate]);

  // Mock data - replace with actual data from your backend
  const stats = {
    totalBookings: 5,
    completedServices: 3,
    totalOrders: 8,
    savedAmount: 2500,
  };

  const bookings = [
    {
      id: 1,
      service: 'Regular Maintenance',
      date: '2024-03-15',
      time: '10:00 AM',
      status: 'Completed',
      rating: 4,
      price: 2999,
    },
    {
      id: 2,
      service: 'Brake Service',
      date: '2024-03-20',
      time: '02:30 PM',
      status: 'Pending',
      price: 1499,
    },
  ];

  const orders = [
    {
      id: 1,
      items: ['Engine Oil Filter', 'Brake Pads'],
      date: '2024-03-10',
      total: 2499,
      status: 'Delivered',
    },
    {
      id: 2,
      items: ['Air Filter'],
      date: '2024-03-18',
      total: 999,
      status: 'Processing',
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the user profile
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

  if (!userData) {
    return null;
  }

  return (
    <div className="my-account">
      <div className="account-header">
        <div className="header-content">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="user-info">
            <h1>Welcome, {userData.username}!</h1>
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
                name="username"
                value={isEditing ? editedData.username : userData.username}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={isEditing ? editedData.email : userData.email}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={isEditing ? editedData.phone : userData.phone || ''}
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
                value={isEditing ? editedData.address : userData.address || ''}
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
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.service}</h3>
                    <span className={`status ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p>
                      <FaCalendar /> {booking.date}
                    </p>
                    <p>
                      <FaClock /> {booking.time}
                    </p>
                    <p>
                      <FaRupeeSign /> {booking.price}
                    </p>
                  </div>
                  {booking.status === 'Completed' && (
                    <div className="rating">
                      <span>Rate your service:</span>
                      <div className="stars">{renderStars(booking.rating, booking.id)}</div>
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
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.id}</h3>
                    <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                  <div className="order-details">
                    <p>
                      <FaBox /> Items: {order.items.join(', ')}
                    </p>
                    <p>
                      <FaCalendar /> {order.date}
                    </p>
                    <p>
                      <FaRupeeSign /> {order.total}
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
