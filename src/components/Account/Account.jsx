import React, { useState } from 'react';
import './Account.css';
import {
  FaUser,
  FaHistory,
  FaShoppingBag,
  FaStar,
  FaSignOutAlt,
  FaEdit,
  FaDownload,
} from 'react-icons/fa';

const Account = ({ onLogout, onRateClick }) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user')) || {
    name: 'Guest User',
    email: 'guest@example.com',
    phone: 'Not provided',
    address: 'Not provided',
  };

  // Mock bookings data
  const bookings = [
    {
      id: 1,
      service: 'Regular Maintenance',
      date: '2024-02-15',
      time: '10:00 AM',
      status: 'Completed',
      amount: 2500,
    },
    {
      id: 2,
      service: 'Oil Change',
      date: '2024-03-20',
      time: '2:30 PM',
      status: 'Pending',
      amount: 1500,
    },
  ];

  // Mock orders data
  const orders = [
    {
      id: 1,
      date: '2024-02-10',
      items: [
        { name: 'Oil Filter', quantity: 1, price: 500 },
        { name: 'Engine Oil', quantity: 2, price: 1000 },
      ],
      status: 'Delivered',
      total: 2500,
    },
    {
      id: 2,
      date: '2024-03-15',
      items: [
        { name: 'Brake Pads', quantity: 2, price: 1200 },
        { name: 'Air Filter', quantity: 1, price: 400 },
      ],
      status: 'Processing',
      total: 2800,
    },
  ];

  return (
    <div className="account-container">
      <div className="account-sidebar">
        <div className="user-info">
          <div className="user-avatar">
            <FaUser />
          </div>
          <h3>{userData.name}</h3>
          <p>{userData.email}</p>
        </div>
        <nav className="account-nav">
          <button
            className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <FaUser /> Profile
          </button>
          <button
            className={`nav-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <FaHistory /> My Bookings
          </button>
          <button
            className={`nav-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingBag /> Order History
          </button>
          <button className="nav-button" onClick={onRateClick}>
            <FaStar /> Rate Us
          </button>
          <button className="nav-button logout" onClick={onLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </div>

      <div className="account-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Profile Information</h2>
              <button className="edit-button">
                <FaEdit /> Edit Profile
              </button>
            </div>
            <div className="profile-details">
              <div className="detail-group">
                <label>Full Name</label>
                <p>{userData.name}</p>
              </div>
              <div className="detail-group">
                <label>Email</label>
                <p>{userData.email}</p>
              </div>
              <div className="detail-group">
                <label>Phone</label>
                <p>{userData.phone}</p>
              </div>
              <div className="detail-group">
                <label>Address</label>
                <p>{userData.address}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>My Bookings</h2>
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.service}</h3>
                    <span className={`status ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p>
                      <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Time:</strong> {booking.time}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹{booking.amount}
                    </p>
                  </div>
                  <button className="invoice-button">
                    <FaDownload /> Download Invoice
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Order History</h2>
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <div className="order-total">
                      <strong>Total:</strong> ₹{order.total}
                    </div>
                    <button className="invoice-button">
                      <FaDownload /> Download Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
