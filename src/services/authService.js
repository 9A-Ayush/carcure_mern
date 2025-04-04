import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with default config
const authAxios = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // 15 second timeout
});

// Add token to requests if available
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Remove Bearer prefix if it exists when setting the header
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    config.headers.Authorization = `Bearer ${tokenValue}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      authService.clearSession();
    }
    return Promise.reject(error);
  }
);

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode token to check expiry
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    const now = Math.floor(Date.now() / 1000);
    
    // Add 5 minute buffer to prevent edge cases
    return now >= (exp - 300);
  } catch (error) {
    console.error('Error checking token expiry:', error);
    authService.clearSession();
    return true;
  }
};

// Validate token format
const isValidToken = (token) => {
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Check each part can be decoded
    parts.forEach(part => {
      const decoded = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      if (!decoded) return false;
    });
    
    return true;
  } catch (error) {
    console.error('Error validating token format:', error);
    return false;
  }
};

// Check if the user is connected to the internet
const checkConnection = () => {
  return navigator.onLine;
};

// Retry logic for failed requests
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

export const authService = {
  initSession: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      authService.clearSession();
      return null;
    }

    try {
      if (!isValidToken(token) || isTokenExpired(token)) {
        console.log('Token is invalid or expired');
        authService.clearSession();
        return null;
      }

      const user = JSON.parse(userStr);
      return { token, user };
    } catch (error) {
      console.error('Error initializing session:', error);
      authService.clearSession();
      return null;
    }
  },

  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear(); // Clear any session-specific data
  },

  login: async (email, password) => {
    try {
      const response = await authAxios.post('/login', { email, password });
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token without Bearer prefix
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Verify token was stored
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        throw new Error('Failed to store authentication token');
      }

      console.log('Login successful - Token stored');
      return {
        success: true,
        token: tokenValue,
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      // Clear any partial auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await authAxios.post('/register', { name, email, password });
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token without Bearer prefix
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Verify token was stored
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        throw new Error('Failed to store authentication token');
      }

      console.log('Registration successful - Token stored');
      return {
        success: true,
        token: tokenValue,
        user
      };
    } catch (error) {
      console.error('Registration error:', error);
      // Clear any partial auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Force reload to clear any cached state
    window.location.reload();
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getStoredToken: () => {
    return localStorage.getItem('token');
  },

  getStoredUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  refreshSession: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await authAxios.post('/refresh-token');
      const { token: newToken, user } = response.data;
      
      // Store new token without Bearer prefix
      const tokenValue = newToken.startsWith('Bearer ') ? newToken.slice(7) : newToken;
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('user', JSON.stringify(user));
      
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      authService.clearSession();
      return false;
    }
  },

  isValidToken: (token) => {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Check each part can be decoded
      parts.forEach(part => {
        const decoded = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
        if (!decoded) return false;
      });
      
      return true;
    } catch (error) {
      console.error('Error validating token format:', error);
      return false;
    }
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      // Decode token to check expiry
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      const { exp } = JSON.parse(jsonPayload);
      const now = Math.floor(Date.now() / 1000);
      
      return now >= exp;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  },

  checkConnection
};
