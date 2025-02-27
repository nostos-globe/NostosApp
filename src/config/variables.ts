// For Android emulator, 10.0.2.2 is the special alias to reach host's localhost
export const API_URL = 'http://10.0.2.2:8080/';

export const AUTH_ENDPOINTS = {
    LOGIN: '/login',
    SIGNUP: '/register',
    LOGOUT: '/logout',
    REFRESH_TOKEN: '/refresh-token'
};

// Add any other global configurations here
export const APP_CONFIG = {
    API_TIMEOUT: 5000,
    DEFAULT_LANGUAGE: 'en',
};