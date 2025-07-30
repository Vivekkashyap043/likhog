// API Configuration
// Central place to manage all API endpoints and base URLs

// Base URL for the API server
export const API_BASE_URL = 'https://likhog-server.onrender.com';

// API endpoints organized by service
export const API_ENDPOINTS = {
  // Common endpoints
  COMMON: {
    STATS: `${API_BASE_URL}/common-api/get-stats`,
    SEND_VERIFICATION: `${API_BASE_URL}/common-api/send-verification`,
    VERIFY_EMAIL: `${API_BASE_URL}/common-api/verify-email`,
    FORGOT_PASSWORD: `${API_BASE_URL}/common-api/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/common-api/reset-password`,
  },
  
  // User endpoints
  USER: {
    REGISTER: `${API_BASE_URL}/user-api/user`,
    LOGIN: `${API_BASE_URL}/user-api/login`,
    ARTICLES: `${API_BASE_URL}/user-api/articles`,
    ARTICLE_BY_ID: (id) => `${API_BASE_URL}/user-api/article/${id}`,
    LIKE_ARTICLE: (id) => `${API_BASE_URL}/user-api/like/${id}`,
    VIEW_ARTICLE: (id) => `${API_BASE_URL}/user-api/view/${id}`,
    COMMENT: (id) => `${API_BASE_URL}/user-api/comment/${id}`,
    USER_DETAILS: (username) => `${API_BASE_URL}/user-api/user-details/${username}`,
    PROFILE: (username) => `${API_BASE_URL}/user-api/profile/${username}`,
  },
  
  // Author endpoints
  AUTHOR: {
    REGISTER: `${API_BASE_URL}/author-api/author`,
    LOGIN: `${API_BASE_URL}/author-api/login`,
    ARTICLE: `${API_BASE_URL}/author-api/article`,
    ARTICLE_BY_ID: (id) => `${API_BASE_URL}/author-api/article/${id}`,
    DELETE_ARTICLE: (id) => `${API_BASE_URL}/author-api/article/${id}`,
    RESTORE_ARTICLE: (id) => `${API_BASE_URL}/author-api/article/${id}`,
    ARTICLES_BY_AUTHOR: (authorName) => `${API_BASE_URL}/author-api/articles/${authorName}`,
    PROFILE: (username) => `${API_BASE_URL}/author-api/profile/${username}`,
  },
  
  // Admin endpoints (if needed)
  ADMIN: {
    // Add admin endpoints here when needed
  }
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Export the base URL for direct use
export default API_BASE_URL;
