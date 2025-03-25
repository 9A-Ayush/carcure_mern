// API configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// Base API URL
export const API_URL = 'http://localhost:5001';

// Auth API URL
export const AUTH_API_URL = `${API_URL}/auth`;

// Other API endpoints
export const APPOINTMENTS_API_URL = `${API_URL}/appointments`;
export const RATINGS_API_URL = `${API_URL}/ratings`;
export const CHATBOT_API_URL = `${API_URL}/chatbot`;

// Config object
export const config = {
  apiUrl: API_URL,
  authApiUrl: AUTH_API_URL,
  appointmentsApiUrl: APPOINTMENTS_API_URL,
  ratingsApiUrl: RATINGS_API_URL,
  chatbotApiUrl: CHATBOT_API_URL,
  tokenStorageKey: 'token',
  userStorageKey: 'user',
  tokenExpiryKey: 'tokenExpiry'
};

// Other configuration settings can be added here
export const APP_CONFIG = {
  MAX_FILE_SIZE: 5242880, // 5MB
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png'],
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm'
};

export default config;
