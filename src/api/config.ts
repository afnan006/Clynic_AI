/**
 * API Configuration
 * This file contains configuration for API endpoints and determines whether to use mock APIs
 */

// Determine if we should use mock APIs based on environment variable
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// Base URL for API requests
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGN_IN_EMAIL: '/auth/signin/email',
    SIGN_IN_GOOGLE: '/auth/signin/google',
    SIGN_IN_PHONE: '/auth/signin/phone',
    SEND_OTP: '/auth/otp/send',
    REFRESH_TOKEN: '/auth/refresh',
    SIGN_OUT: '/auth/signout',
  },
  
  // Assessment endpoints
  ASSESSMENT: {
    SUBMIT: '/assessment/submit',
    GET_BY_ID: '/assessment/:id',
    GET_USER_ASSESSMENTS: '/assessment/user/:userId',
  },
  
  // Chat endpoints
  CHAT: {
    SEND_MESSAGE: '/chat/message',
    GET_HISTORY: '/chat/history',
  },
  
  // Notification endpoints
  NOTIFICATION: {
    SUBSCRIBE_PUSH: '/notifications/push/subscribe',
    UNSUBSCRIBE_PUSH: '/notifications/push/unsubscribe',
    UPDATE_SETTINGS: '/notifications/settings',
    GET_SETTINGS: '/notifications/settings',
  },
  
  // Payment endpoints
  PAYMENT: {
    PROCESS: '/payments/process',
    HISTORY: '/payments/history',
    DETAILS: '/payments/:id',
  },
  
  // Settings endpoints
  SETTINGS: {
    UPDATE_PROFILE: '/users/:userId/profile',
    CHANGE_PASSWORD: '/users/:userId/change-password',
    EXPORT_DATA: '/users/:userId/export-data',
    DELETE_ACCOUNT: '/users/:userId',
  },
};

// Replace path parameters in URL
export const formatEndpoint = (endpoint: string, params: Record<string, string>) => {
  let formattedEndpoint = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    formattedEndpoint = formattedEndpoint.replace(`:${key}`, value);
  });
  return formattedEndpoint;
};