import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with base URL
const appointmentAxios = axios.create({
  baseURL: `${API_URL}/api/appointments`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization header to requests when token exists
appointmentAxios.interceptors.request.use(
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

// Format error message
const formatErrorMessage = (error) => {
  if (isConnectionError(error)) {
    return 'Connection error. Please check your internet connection and try again.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return 'Please login to book an appointment.';
  }
  
  if (error.response?.status === 400) {
    return 'Please check your input and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Book a new appointment
export const bookAppointment = async (appointmentData) => {
  try {
    const response = await appointmentAxios.post('/', appointmentData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Booking appointment error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Get all user appointments
export const getUserAppointments = async () => {
  try {
    const response = await appointmentAxios.get('/user');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Fetching appointments error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Get appointment details by ID
export const getAppointmentById = async (id) => {
  try {
    const response = await appointmentAxios.get(`/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Fetching appointment details error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Update appointment
export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await appointmentAxios.put(`/${id}`, appointmentData);
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
      error: error.response?.data?.message || 'Failed to update appointment. Please try again.'
    };
  }
};

// Cancel appointment
export const cancelAppointment = async (id) => {
  try {
    const response = await appointmentAxios.delete(`/${id}`);
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
      error: error.response?.data?.message || 'Failed to cancel appointment. Please try again.'
    };
  }
};

// Admin functions

// Get all appointments (admin only)
export const getAllAppointments = async () => {
  try {
    const response = await appointmentAxios.get('/');
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
      error: error.response?.data?.message || 'Failed to fetch appointments. Please try again.'
    };
  }
};

// Update appointment status (admin only)
export const updateAppointmentStatus = async (id, status) => {
  try {
    const response = await appointmentAxios.put(`/${id}/status`, { status });
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
      error: error.response?.data?.message || 'Failed to update appointment status. Please try again.'
    };
  }
};

// Get appointment statistics (admin only)
export const getAppointmentStats = async () => {
  try {
    const response = await appointmentAxios.get('/stats');
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
      error: error.response?.data?.message || 'Failed to fetch appointment statistics. Please try again.'
    };
  }
};
