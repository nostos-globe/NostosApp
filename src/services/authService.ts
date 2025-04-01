import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, AUTH_ENDPOINTS, APP_CONFIG, AUTH_STORAGE } from '../config/variables';

const api = axios.create({
    baseURL: API_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add token to requests if it exists
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(AUTH_STORAGE.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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

export interface PasswordResetCredentials {
    email: string;
}

export interface NewPasswordCredentials {
    token: string;
    newPassword: string;
}

export interface UpdatePasswordCredentials {
    oldPassword: string;
    newPassword: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
    };
    token : string;
}

export const authService = {
    async login(credentials: UserCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
            // Store the tokens
            if (response.data.token) {
                await AsyncStorage.setItem(AUTH_STORAGE.TOKEN, response.data.token);
            }
            if (response.data.refreshToken) {
                await AsyncStorage.setItem(AUTH_STORAGE.REFRESH_TOKEN, response.data.refreshToken);
            }
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
            // Clear stored tokens
            await AsyncStorage.multiRemove([AUTH_STORAGE.TOKEN, AUTH_STORAGE.REFRESH_TOKEN]);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    },

    async validateToken(): Promise<boolean> {
        try {
            await api.post(AUTH_ENDPOINTS.VALIDATE_TOKEN);
            return true;
        } catch (error) {
            return false;
        }
    },

    async requestPasswordReset(credentials: PasswordResetCredentials): Promise<void> {
        try {
            await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, credentials);
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Password reset request failed');
            }
            throw new Error('Network error occurred');
        }
    },

    async resetPassword(credentials: NewPasswordCredentials): Promise<void> {
        try {
            await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, credentials);
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Password reset failed');
            }
            throw new Error('Network error occurred');
        }
    },

    async updatePassword(credentials: UpdatePasswordCredentials): Promise<void> {
        try {
            await api.post(AUTH_ENDPOINTS.UPDATE_PASSWORD, credentials);
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Password update failed');
            }
            throw new Error('Network error occurred');
        }
    },

    async getProfile(): Promise<any> {
        try {
            const response = await api.get(AUTH_ENDPOINTS.PROFILE);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch profile');
            }
            throw new Error('Network error occurred');
        }
    }
};