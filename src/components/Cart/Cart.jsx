import React, { useState, useEffect } from 'react';
import './Cart.css';
import { FaTimes, FaPlus, FaMinus, FaUser } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const Cart = ({ isOpen, onClose, isAuthenticated, onAuthRequired }) => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    // Check authentication when the component opens and if checkout is attempted
    if (isOpen && !isAuthenticated) {
      setShowAuthPrompt(true);
    } else {
      setShowAuthPrompt(false);
    }
  }, [isOpen, isAuthenticated]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    // Add your checkout logic here
    console.log('Proceeding to checkout with items:', cartItems);
    // You could redirect to a checkout page or open a checkout modal
    alert('Thank you for your order! Total: ₹' + total);
    // Clear cart and close it after order
    cartItems.forEach((item) => removeFromCart(item.id));
    onClose();
  };

  const handleAuthRedirect = () => {
    onClose();
    onAuthRequired();
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      <div className="cart-content">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-cart" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {showAuthPrompt ? (
          <div className="auth-prompt">
            <FaUser className="auth-icon" />
            <h2>Sign in Required</h2>
            <p>Please sign in or create an account to complete your purchase.</p>
            <button className="checkout-btn" onClick={handleAuthRedirect}>
              Sign in / Sign up
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.length === 0 ? (
                <p className="empty-cart">Your cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-price">₹{item.price}</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}>
                          <FaMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                    <button className="remove-item" onClick={() => removeFromCart(item.id)}>
                      <FaTimes />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span>₹{total}</span>
              </div>
              <button
                className="checkout-btn"
                disabled={cartItems.length === 0}
                onClick={handleCheckout}
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
