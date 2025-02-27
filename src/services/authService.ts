import axios from 'axios';
import { API_URL, AUTH_ENDPOINTS, APP_CONFIG } from '../config/variables';

const api = axios.create({
    baseURL: API_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Enable sending and receiving cookies
});

api.interceptors.request.use(
    (config) => {
        console.log('API Request:', config.url);
        return config;
    },
    (error: any) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export interface UserCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
    };
}

export const authService = {
    async login(credentials: UserCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Login failed');
            }
            throw new Error('Network error occurred');
        }
    },

    async signup(credentials: UserCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post(AUTH_ENDPOINTS.SIGNUP, credentials);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Signup failed');
            }
            throw new Error('Network error occurred');
        }
    },

    async logout(): Promise<void> {
        try {
            await api.post(AUTH_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }
};