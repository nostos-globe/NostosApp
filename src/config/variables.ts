// For Android emulator, 10.0.2.2 is the special alias to reach host's localhost
export const API_URL = 'https://auth.nostos-globe.me';
export const PROFILE_API_URL = 'https://profile.nostos-globe.me';
export const MEDIA_API_URL = 'https://trips.nostos-globe.me';
export const GLOBES_API_URL = 'https://albums.nostos-globe.me';
export const LIKES_API_URL =  'https://actions.nostos-globe.me';

export const AUTH_ENDPOINTS = {
    LOGIN: '/login',
    SIGNUP: '/register',
    LOGOUT: '/logout',
    REFRESH_TOKEN: '/refresh-token',
    VALIDATE_TOKEN: '/validate',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    UPDATE_PASSWORD: '/update-password',
    PROFILE: '/profile'
};

// Add any other global configurations here
export const APP_CONFIG = {
    API_TIMEOUT: 5000,
    DEFAULT_LANGUAGE: 'en',
    USER_ID: '@nostos_user_id',
    TOKEN_STORAGE_KEY: '@nostos_auth_token',    // Key for storing the auth token
    REFRESH_TOKEN_STORAGE_KEY: '@nostos_refresh_token'    // Key for storing the refresh token
};

// Storage keys for authentication
export const AUTH_STORAGE = {
    USER_ID: APP_CONFIG.USER_ID,
    TOKEN: APP_CONFIG.TOKEN_STORAGE_KEY,
    REFRESH_TOKEN: APP_CONFIG.REFRESH_TOKEN_STORAGE_KEY
};