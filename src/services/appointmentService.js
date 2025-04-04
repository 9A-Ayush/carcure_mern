import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance with default config
const appointmentAxios = axios.create({
  baseURL: `${API_URL}/api/appointments`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 second timeout
});

// Add token to requests if available
appointmentAxios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return Promise.reject({ 
        isAuthError: true,
        message: 'Please login to book an appointment'
      });
    }

    // Remove Bearer prefix if it exists when setting the header
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    config.headers['Authorization'] = `Bearer ${tokenValue}`;
    console.log('Added token to request headers');
    return config;
  } catch (error) {
    console.error('Error in request interceptor:', error);
    return Promise.reject({ 
      isAuthError: true,
      message: 'Authentication error. Please try logging in again.'
    });
  }
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Handle response errors
appointmentAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 401) {
      // Don't clear token here, just indicate auth error
      return Promise.reject({ 
        isAuthError: true,
        message: 'Please login to book an appointment'
      });
    }
    return Promise.reject(error);
  }
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
    console.log('Starting bookAppointment with data:', appointmentData);
    
    // Check authentication first
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in bookAppointment');
      return {
        success: false,
        error: 'Please login to book an appointment',
        requiresAuth: true
      };
    }

    // Validate token format
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid token format');
      return {
        success: false,
        error: 'Please login again to book an appointment',
        requiresAuth: true
      };
    }

    console.log('Token found and validated, proceeding with booking');

    // Validate required fields
    const requiredFields = ['customerName', 'email', 'phoneNumber', 'service', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !appointmentData[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }
    console.log('All required fields present');

    // Validate vehicle details
    const vehicleDetails = appointmentData.vehicleDetails || {};
    const requiredVehicleFields = ['make', 'model', 'year', 'registrationNumber'];
    const missingVehicleFields = requiredVehicleFields.filter(field => !vehicleDetails[field]);
    
    if (missingVehicleFields.length > 0) {
      console.log('Missing vehicle details:', missingVehicleFields);
      return {
        success: false,
        error: `Missing required vehicle details: ${missingVehicleFields.join(', ')}`
      };
    }
    console.log('All vehicle details present');

    // Format the data to match backend expectations
    const formattedData = {
      service: appointmentData.service,
      date: appointmentData.date,
      time: appointmentData.time,
      message: appointmentData.message || '',
      vehicleDetails: JSON.stringify({
        make: vehicleDetails.make,
        model: vehicleDetails.model,
        year: parseInt(vehicleDetails.year),
        registrationNumber: vehicleDetails.registrationNumber.toUpperCase()
      }),
      customerName: appointmentData.customerName,
      email: appointmentData.email,
      phoneNumber: appointmentData.phoneNumber.startsWith('+91') 
        ? appointmentData.phoneNumber 
        : `+91${appointmentData.phoneNumber}`
    };

    console.log('Making appointment request with formatted data:', formattedData);
    
    const response = await appointmentAxios.post('/', formattedData);
    console.log('Appointment response:', response.data);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    }
    
    return {
      success: false,
      error: response.data.message || 'Failed to book appointment'
    };
  } catch (error) {
    console.error('Booking appointment error:', error);
    
    // Handle auth errors
    if (error.isAuthError) {
      return {
        success: false,
        error: error.message,
        requiresAuth: true
      };
    }
    
    if (error.response?.status === 400) {
      return {
        success: false,
        error: error.response.data.message || 'Invalid appointment data'
      };
    }
    
    if (error.response?.status === 409) {
      return {
        success: false,
        error: 'This time slot is already booked. Please select a different time.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to book appointment'
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
    console.error('Updating appointment error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Cancel appointment
export const cancelAppointment = async (id) => {
  try {
    const response = await appointmentAxios.put(`/${id}/cancel`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Cancelling appointment error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
    };
  }
};

// Book a new appointment through chatbot (works for both logged-in and anonymous users)
export const bookChatbotAppointment = async (appointmentData) => {
  try {
    const response = await axios.post(`${API_URL}/api/appointments/chatbot`, appointmentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Booking chatbot appointment error:', error);
    return {
      success: false,
      error: formatErrorMessage(error)
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
