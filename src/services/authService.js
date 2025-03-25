import axios from 'axios';
import { AUTH_API_URL } from '../config';

// Create an axios instance with default config
const authAxios = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add token to requests if available
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle common errors
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's a network error
    if (error.message === 'Network Error' || !navigator.onLine) {
      console.error('Network connection error:', error);
      return Promise.reject({ 
        message: 'Please check your connection and try again.',
        isConnectionError: true
      });
    }
    
    // Handle server errors
    if (error.response) {
      console.error('API Error:', error.response.data);
      
      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401:
          return Promise.reject({ 
            message: 'Invalid credentials. Please check your username and password.',
            isAuthError: true
          });
        case 403:
          return Promise.reject({ 
            message: 'You do not have permission to access this resource.',
            isForbiddenError: true
          });
        case 404:
          return Promise.reject({ 
            message: 'The requested resource was not found.',
            isNotFoundError: true
          });
        case 500:
          return Promise.reject({ 
            message: 'Server error. Please try again later.',
            isServerError: true
          });
        default:
          return Promise.reject(error.response.data || { 
            message: 'An error occurred. Please try again.' 
          });
      }
    }
    
    return Promise.reject(error);
  }
);

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Get the expiration time from the token (assuming JWT)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Check if the user is connected to the internet
const checkConnection = () => {
  return navigator.onLine;
};

export const authService = {
  login: async (credentials) => {
    try {
      // Check internet connection first
      if (!checkConnection()) {
        throw { 
          message: 'Please check your connection and try again.',
          isConnectionError: true
        };
      }
      
      console.log('Attempting login with credentials:', { username: credentials.username, passwordLength: credentials.password?.length });
      
      const response = await authAxios.post('/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('tokenExpiry', new Date().getTime() + (24 * 60 * 60 * 1000)); // 24 hours
        
        // Store user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('Login error details:', error);
      
      // If it's already a formatted error from our interceptor, just throw it
      if (error.isConnectionError || error.isAuthError || error.isServerError) {
        throw error;
      }
      
      throw error.response?.data || { 
        message: 'Login failed. Please check your connection and try again.' 
      };
    }
  },

  signup: async (userData) => {
    try {
      // Check internet connection first
      if (!checkConnection()) {
        throw { 
          message: 'Please check your connection and try again.',
          isConnectionError: true
        };
      }
      
      console.log('Attempting signup with data:', { 
        username: userData.username, 
        email: userData.email,
        passwordLength: userData.password?.length 
      });
      
      const response = await authAxios.post('/signup', userData);
      console.log('Signup response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('tokenExpiry', new Date().getTime() + (24 * 60 * 60 * 1000)); // 24 hours
        
        // Store user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error) {
      console.error('Signup error details:', error);
      
      // If it's already a formatted error from our interceptor, just throw it
      if (error.isConnectionError || error.isAuthError || error.isServerError) {
        throw error;
      }
      
      throw error.response?.data || { 
        message: 'Signup failed. Please check your connection and try again.' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token) return false;
    
    // Check if token is expired based on our stored expiry time
    if (tokenExpiry && new Date().getTime() > parseInt(tokenExpiry)) {
      // Token is expired, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      return false;
    }
    
    // Also check the actual JWT expiry
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      return false;
    }
    
    return true;
  },

  refreshToken: async () => {
    try {
      const response = await authAxios.post('/refresh-token');
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('tokenExpiry', new Date().getTime() + (24 * 60 * 60 * 1000)); // 24 hours
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      return false;
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  checkConnection
};
