// For Android emulator, 10.0.2.2 is the special alias to reach host's localhost
export const API_URL = 'http://10.0.2.2:8082/';

export const AUTH_ENDPOINTS = {
    LOGIN: '/login',
    SIGNUP: '/register',
    LOGOUT: '/logout',
    PROFILE:"/profile",
    REFRESH_TOKEN: '/refresh-token'
};

export const PROFILE_URL = 'http://10.0.2.2:8083/api';

export const PROFILE_ENDPOINTS = {
    // Profile management
    CREATE: '/profiles',
    UPDATE: '/profiles/update',
    UPDATE_BY_ID: '/profiles/updateProfileByID',
    DELETE: '/profiles/delete',

    // Profile retrieval
    GET_PROFILE: '/profiles/user',
    GET_PROFILE_BY_USERNAME: '/profiles/username',
    SEARCH: '/profiles/search',

    // Follow system
    FOLLOW: '/follow',
    UNFOLLOW: '/unfollow',
    LIST_FOLLOWERS: '/followers',
    LIST_FOLLOWING: '/following'
};
// Add any other global configurations here
export const APP_CONFIG = {
    API_TIMEOUT: 5000,
    DEFAULT_LANGUAGE: 'en',
};