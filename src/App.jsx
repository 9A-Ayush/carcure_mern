import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import { Hero } from './components/Hero/Hero';
import Services from './components/Services/Services';
import About from './components/About/About';
import Spares from './components/Spares/Spares';
import BookingForm from './components/BookingForm/BookingForm';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Contact from './components/Contact/Contact';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Rating from './components/Rating/Rating';
import Cart from './components/Cart/Cart';
import AuthModal from './components/Auth/AuthModal';
import ResetPassword from './components/Auth/ResetPassword';
import MyAccount from './components/MyAccount/MyAccount';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Chatbot from './components/Chatbot/Chatbot';

// Import the new component
import MyAppointments from './pages/MyAppointments/MyAppointments';

const HomePage = () => (
  <>
    <Hero />
    <About />
    <Services />
    <Spares />
    <BookingForm />
    <Contact />
  </>
);

const AppContent = () => {
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const handleRateClick = () => {
    if (isAuthenticated) {
      setIsRatingOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleCartClick = () => {
    if (isAuthenticated) {
      setIsCartOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleAuthClick = () => {
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <Navbar 
        onRateClick={handleRateClick}
        onCartClick={handleCartClick}
        onAuthClick={handleAuthClick}
        isLoggedIn={isAuthenticated}
        onLogout={handleLogout}
        user={user}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-account" element={<ProtectedRoute><MyAccount onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        // Add this to your routes
        <Route path="/my-appointments" element={<MyAppointments onRateClick={handleRateClick} />} />
      </Routes>
      <Footer 
        onRateClick={handleRateClick}
        onCartClick={handleCartClick}
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
        isLoggedIn={isAuthenticated}
      />
      <ScrollToTop />
      <Rating 
        isOpen={isRatingOpen} 
        onClose={() => setIsRatingOpen(false)} 
        isAuthenticated={isAuthenticated}
        onAuthRequired={() => setIsAuthOpen(true)}
      />
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        isAuthenticated={isAuthenticated}
        onAuthRequired={() => setIsAuthOpen(true)}
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
      />
      <Chatbot />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;