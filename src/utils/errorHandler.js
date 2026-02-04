/**
 * Error Handler Utility
 * Centralized error handling for HTTP requests and common error scenarios
 */

// HTTP Status Code Categories
const ERROR_CATEGORIES = {
  CLIENT_ERROR: 'CLIENT_ERROR',    // 400-499
  SERVER_ERROR: 'SERVER_ERROR',    // 500-599
  NETWORK_ERROR: 'NETWORK_ERROR',  // Connection issues
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'   // Request timeout
};

// Common error messages by status code
const ERROR_MESSAGES = {
  400: 'Bad Request - Please check your input data',
  401: 'Unauthorized - Please login again',
  403: 'Access Denied - You don\'t have permission for this action',
  404: 'Resource not found - The requested item could not be located',
  409: 'Conflict - This item already exists or conflicts with existing data',
  422: 'Validation Error - Please check your input',
  429: 'Rate Limit Exceeded - Please try again later',
  500: 'Server Error - Please try again later',
  502: 'Bad Gateway - Server is temporarily unavailable',
  503: 'Service Unavailable - Please try again later',
  504: 'Gateway Timeout - Server took too long to respond'
};

/**
 * Categorize HTTP error based on status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error category
 */
export function categorizeError(statusCode) {
  if (statusCode >= 400 && statusCode < 500) {
    return ERROR_CATEGORIES.CLIENT_ERROR;
  } else if (statusCode >= 500 && statusCode < 600) {
    return ERROR_CATEGORIES.SERVER_ERROR;
  } else {
    return ERROR_CATEGORIES.NETWORK_ERROR;
  }
}

/**
 * Get user-friendly error message
 * @param {number} statusCode - HTTP status code
 * @param {string} defaultMessage - Fallback message
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(statusCode, defaultMessage = 'An error occurred') {
  return ERROR_MESSAGES[statusCode] || defaultMessage;
}

/**
 * Handle API error with appropriate logging and user feedback
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred (e.g., 'User Login', 'Profile Update')
 * @param {boolean} showUserMessage - Whether to return message for user display
 * @returns {Object} Error details
 */
export function handleApiError(error, context = 'Operation', showUserMessage = true) {
  const errorDetails = {
    context,
    originalError: error,
    userMessage: '',
    logMessage: '',
    category: ERROR_CATEGORIES.NETWORK_ERROR,
    shouldRetry: false
  };

  // Network/Connection errors
  if (!error.response) {
    errorDetails.logMessage = `${context}: Network error or server unreachable`;
    errorDetails.userMessage = 'Network connection failed. Please check your internet connection.';
    errorDetails.shouldRetry = true;
    console.warn(errorDetails.logMessage, error.message);
    return errorDetails;
  }

  const { status, data } = error.response;
  errorDetails.category = categorizeError(status);

  // Handle specific status codes
  switch (status) {
    case 401:
      errorDetails.logMessage = `${context}: Authentication failed`;
      errorDetails.userMessage = 'Your session has expired. Please login again.';
      // Trigger logout or token refresh
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      break;

    case 403:
      errorDetails.logMessage = `${context}: Access forbidden`;
      errorDetails.userMessage = 'You don\'t have permission to perform this action.';
      break;

    case 404:
      errorDetails.logMessage = `${context}: Resource not found`;
      errorDetails.userMessage = 'The requested resource could not be found.';
      errorDetails.shouldRetry = false;
      break;

    case 409:
      errorDetails.logMessage = `${context}: Conflict detected`;
      errorDetails.userMessage = data?.message || 'This item already exists or conflicts with existing data.';
      // 409 conflicts are often expected (like duplicate enrollments) - may not need user notification
      errorDetails.shouldRetry = false;
      break;

    case 429:
      errorDetails.logMessage = `${context}: Rate limit exceeded`;
      errorDetails.userMessage = 'Too many requests. Please wait before trying again.';
      errorDetails.shouldRetry = true;
      break;

    case 500:
      errorDetails.logMessage = `${context}: Internal server error`;
      errorDetails.userMessage = 'Server error occurred. Please try again later.';
      errorDetails.shouldRetry = true;
      break;

    case 503:
    case 504:
      errorDetails.logMessage = `${context}: Service unavailable`;
      errorDetails.userMessage = 'Service temporarily unavailable. Please try again later.';
      errorDetails.shouldRetry = true;
      break;

    default:
      errorDetails.logMessage = `${context}: HTTP ${status} error`;
      errorDetails.userMessage = data?.message || getErrorMessage(status, 'An unexpected error occurred.');
      errorDetails.shouldRetry = status >= 500;
  }

  // Log the error
  if (status >= 500) {
    console.error(errorDetails.logMessage, error.response);
  } else {
    console.warn(errorDetails.logMessage, error.response);
  }

  return errorDetails;
}

/**
 * Handle image loading errors with fallbacks
 * @param {Event} event - The error event
 * @param {string} fallbackSrc - Fallback image source
 * @param {Function} onErrorCallback - Optional callback for additional error handling
 */
export function handleImageError(event, fallbackSrc, onErrorCallback) {
  const imgElement = event.target;
  
  console.log('handleImageError called with:', {
    originalSrc: imgElement.src,
    fallbackSrc: fallbackSrc,
    element: imgElement
  });
  
  // Prevent infinite loops if fallback also fails
  if (imgElement.src === fallbackSrc) {
    console.warn('Both original and fallback images failed to load');
    if (onErrorCallback) onErrorCallback(event);
    return;
  }

  console.warn('Image failed to load, using fallback:', imgElement.src);
  imgElement.src = fallbackSrc;
  
  // Optional callback for additional handling
  if (onErrorCallback) {
    onErrorCallback(event);
  }
}

/**
 * Handle YouTube thumbnail loading errors specifically
 * @param {Event} event - The error event
 */
export function handleYouTubeThumbnailError(event) {
  const fallbackImages = [
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=300"
  ];
  
  const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  handleImageError(event, randomFallback, () => {
    console.log('YouTube thumbnail failed, using random wellness image as fallback');
  });
}

/**
 * Check if error is retryable
 * @param {Error} error - The error object
 * @returns {boolean} Whether the operation should be retried
 */
export function isRetryableError(error) {
  if (!error.response) return true; // Network errors are retryable
  
  const { status } = error.response;
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  return retryableStatuses.includes(status);
}

/**
 * Create a delay for retry attempts
 * @param {number} attempt - Current retry attempt number
 * @returns {Promise} Promise that resolves after delay
 */
export function createRetryDelay(attempt) {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  return new Promise(resolve => setTimeout(resolve, delay));
}

export default {
  categorizeError,
  getErrorMessage,
  handleApiError,
  handleImageError,
  handleYouTubeThumbnailError,
  isRetryableError,
  createRetryDelay,
  ERROR_CATEGORIES
};