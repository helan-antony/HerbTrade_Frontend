// API Configuration
// This file centralizes all API endpoint configurations

// Base API URL - Update this when deploying to production
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';

// Google OAuth Client ID
// Replace this with your new OAuth client ID from Google Cloud Console
export const GOOGLE_CLIENT_ID = '402168891475-ag50v1vdjblsjhd317v8mrn2v9q3dc02.apps.googleusercontent.com';

// Instructions to create a new OAuth client:
// 1. Go to https://console.cloud.google.com/apis/credentials
// 2. Click "Create Credentials" → "OAuth 2.0 Client ID"
// 3. Choose "Web application"
// 4. Add these JavaScript origins:
//    - http://localhost:5173
//    - http://localhost:3000
//    - http://localhost:5174
// 5. Copy the new client ID and replace the one above

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google-login`,
  },
  
  CART: {
    BASE: `${API_BASE_URL}/api/cart`,
    ADD: `${API_BASE_URL}/api/cart/add`,
    UPDATE: (productId) => `${API_BASE_URL}/api/cart/update/${productId}`,
    REMOVE: (productId) => `${API_BASE_URL}/api/cart/remove/${productId}`,
    CLEAR: `${API_BASE_URL}/api/cart/clear`,
  },
  
  WISHLIST: {
    BASE: `${API_BASE_URL}/api/wishlist`,
    ADD: `${API_BASE_URL}/api/wishlist/add`,
    REMOVE: (productId) => `${API_BASE_URL}/api/wishlist/remove/${productId}`,
    CLEAR: `${API_BASE_URL}/api/wishlist/clear`,
  },
  
  PRODUCTS: {
    BASE: `${API_BASE_URL}/api/products`,
    BY_ID: (productId) => `${API_BASE_URL}/api/products/${productId}`,
    SEARCH: `${API_BASE_URL}/api/products/search`,
    CATEGORIES: `${API_BASE_URL}/api/products/categories`,
  },
  
  HOSPITALS: {
    BASE: `${API_BASE_URL}/api/hospitals`,
    BY_ID: (hospitalId) => `${API_BASE_URL}/api/hospitals/${hospitalId}`,
    SEARCH: `${API_BASE_URL}/api/hospitals/search`,
    BOOKINGS: `${API_BASE_URL}/api/hospital-bookings`,
    BOOK: `${API_BASE_URL}/api/hospital-bookings/book`,
  },
  
  APPOINTMENTS: {
    BASE: `${API_BASE_URL}/api/appointments`,
    USER: `${API_BASE_URL}/api/appointments/user`,
    CREATE: `${API_BASE_URL}/api/appointments/create`,
    UPDATE: (appointmentId) => `${API_BASE_URL}/api/appointments/${appointmentId}`,
    DELETE: (appointmentId) => `${API_BASE_URL}/api/appointments/${appointmentId}`,
  },
  
  BLOG: {
    BASE: `${API_BASE_URL}/api/blog`,
    BY_ID: (blogId) => `${API_BASE_URL}/api/blog/${blogId}`,
    COMMENTS: (blogId) => `${API_BASE_URL}/api/blog/${blogId}/comments`,
  },
  
  DISCUSSIONS: {
    BASE: `${API_BASE_URL}/api/discussions`,
    BY_ID: (discussionId) => `${API_BASE_URL}/api/discussions/${discussionId}`,
    REPLIES: (discussionId) => `${API_BASE_URL}/api/discussions/${discussionId}/replies`,
  },
  
  ADMIN: {
    BASE: `${API_BASE_URL}/api/admin`,
    USERS: `${API_BASE_URL}/api/admin/users`,
    PRODUCTS: `${API_BASE_URL}/api/admin/products`,
    ORDERS: `${API_BASE_URL}/api/admin/orders`,
    HOSPITALS: `${API_BASE_URL}/api/admin/hospitals`,
    ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
  },
  
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    BY_ID: (orderId) => `${API_BASE_URL}/api/orders/${orderId}`,
    USER: `${API_BASE_URL}/api/orders/user`,
    CREATE: `${API_BASE_URL}/api/orders/create`,
  },
  
  GOOGLE_PLACES: {
    SEARCH: (place) => `${API_BASE_URL}/api/google-places/search-hospitals/${place}`,
    DETAILS: (placeId) => `${API_BASE_URL}/api/google-places/details/${placeId}`,
  },
  
  COMMENTS: {
    BASE: `${API_BASE_URL}/api/comments`,
    BY_POST: (postId) => `${API_BASE_URL}/api/comments/post/${postId}`,
    CREATE: `${API_BASE_URL}/api/comments/create`,
    UPDATE: (commentId) => `${API_BASE_URL}/api/comments/${commentId}`,
    DELETE: (commentId) => `${API_BASE_URL}/api/comments/${commentId}`,
  },
  
  HEALTH: `${API_BASE_URL}/api/health`,
  TEST: `${API_BASE_URL}/api/test`,
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Authentication failed');
  }
  
  return response;
};

export const API_BASE = API_BASE_URL;

export default API_ENDPOINTS;
