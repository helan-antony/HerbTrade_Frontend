// API Configuration
// This file centralizes all API endpoint configurations

// Base API URL - Update this when deploying to production
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';

// Google OAuth Client ID
// Replace this with your new OAuth client ID from Google Cloud Console
export const GOOGLE_CLIENT_ID = '402168891475-ag50v1vdjblsjhd317v8mrn2v9q3dc02.apps.googleusercontent.com';

// IMPORTANT: If you're getting "Access blocked: authorization error", follow these steps:
// 
// 1. Go to https://console.cloud.google.com/apis/credentials
// 2. Find your OAuth 2.0 Client ID and click on it
// 3. Make sure these Authorized JavaScript origins are added:
//    - http://localhost:5173
//    - http://localhost:3000  
//    - http://localhost:5174
//    - http://127.0.0.1:5173
//    - http://127.0.0.1:3000
// 
// 4. Go to "OAuth consent screen" in the left sidebar:
//    - If your app is in "Testing" mode, add your email to "Test users"
//    - Make sure all required fields are filled out
//    - Consider publishing your app if it's ready for production
//
// 5. Enable required APIs:
//    - Go to "APIs & Services" → "Library"
//    - Search for and enable "Google+ API" (if not already enabled)
//
// 6. If still having issues, try creating a new OAuth client:
//    - Click "Create Credentials" → "OAuth 2.0 Client ID"
//    - Choose "Web application"
//    - Add the JavaScript origins listed above
//    - Replace the GOOGLE_CLIENT_ID above with the new one

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
    GOOGLE_AUTH: `${API_BASE_URL}/api/auth/google-login`,
    CHECK_EMAIL: (email) => `${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`,
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
    ORDER_APPROVE: (orderId) => `${API_BASE_URL}/api/admin/orders/${orderId}/approve`,
    ORDER_STATUS: (orderId) => `${API_BASE_URL}/api/admin/orders/${orderId}/status`,
    ORDER_ASSIGN: (orderId) => `${API_BASE_URL}/api/admin/orders/${orderId}/assign-delivery`,
    ORDER_NEAREST_DELIVERIES: (orderId) => `${API_BASE_URL}/api/admin/orders/${orderId}/nearest-deliveries`,
    ORDER_AUTO_ASSIGN: (orderId) => `${API_BASE_URL}/api/admin/orders/${orderId}/auto-assign-delivery`,
    DELIVERIES: `${API_BASE_URL}/api/admin/deliveries`,
    DELIVERY_LOCATION: (deliveryId) => `${API_BASE_URL}/api/admin/deliveries/${deliveryId}/location`,
    DELIVERY_AVAILABILITY: (deliveryId) => `${API_BASE_URL}/api/admin/deliveries/${deliveryId}/availability`,
    HOSPITALS: `${API_BASE_URL}/api/admin/hospitals`,
    ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
  },
  
  DELIVERY: {
    BASE: `${API_BASE_URL}/api/delivery`,
    ORDERS: `${API_BASE_URL}/api/delivery/orders`,
    AVAILABLE: `${API_BASE_URL}/api/delivery/orders/available`,
    CLAIM: (orderId) => `${API_BASE_URL}/api/delivery/orders/${orderId}/claim`,
    UPDATE_STATUS: (orderId) => `${API_BASE_URL}/api/delivery/orders/${orderId}/status`,
    PROFILE: `${API_BASE_URL}/api/delivery/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/delivery/change-password`,
    LOCATION: `${API_BASE_URL}/api/delivery/location`,
    AVAILABILITY: `${API_BASE_URL}/api/delivery/availability`,
  },
  
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    BY_ID: (orderId) => `${API_BASE_URL}/api/orders/${orderId}`,
    USER: `${API_BASE_URL}/api/orders/user`,
    CREATE: `${API_BASE_URL}/api/orders/create`,
    MY_ORDERS: `${API_BASE_URL}/api/orders/my-orders`,
    CANCEL: (orderId) => `${API_BASE_URL}/api/orders/${orderId}/cancel`,
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
