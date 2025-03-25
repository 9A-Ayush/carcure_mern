import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with base URL
const ratingAxios = axios.create({
  baseURL: `${API_URL}/ratings`
});

// Add authorization header to requests when token exists
ratingAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Check if there's a connection error
const isConnectionError = (error) => {
  return !error.response && error.request;
};

// Submit a new rating
export const submitRating = async (ratingData) => {
  try {
    const response = await ratingAxios.post('/', ratingData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit rating. Please try again.'
    };
  }
};

// Get all user ratings
export const getUserRatings = async () => {
  try {
    const response = await ratingAxios.get('/user');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch your ratings. Please try again.'
    };
  }
};

// Get rating details by ID
export const getRatingById = async (id) => {
  try {
    const response = await ratingAxios.get(`/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch rating details. Please try again.'
    };
  }
};

// Update rating
export const updateRating = async (id, ratingData) => {
  try {
    const response = await ratingAxios.put(`/${id}`, ratingData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update rating. Please try again.'
    };
  }
};

// Delete rating
export const deleteRating = async (id) => {
  try {
    const response = await ratingAxios.delete(`/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete rating. Please try again.'
    };
  }
};

// Admin functions

// Get all ratings (admin only)
export const getAllRatings = async () => {
  try {
    const response = await ratingAxios.get('/');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch ratings. Please try again.'
    };
  }
};

// Get rating statistics (admin only)
export const getRatingStats = async () => {
  try {
    const response = await ratingAxios.get('/stats');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    if (isConnectionError(error)) {
      return {
        success: false,
        error: 'Connection error. Please check your internet connection and try again.'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch rating statistics. Please try again.'
    };
  }
};
