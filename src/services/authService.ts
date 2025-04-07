import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, AUTH_ENDPOINTS, APP_CONFIG, AUTH_STORAGE } from '../config/variables';
import { Profile } from './profileService';

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
// Add this variable to track refresh token promise
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Helper to add new request to subscribers
const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

// Helper to notify all subscribers
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

// Update the response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (!isRefreshing) {
                isRefreshing = true;
                originalRequest._retry = true;

                try {
                    const refreshToken = await AsyncStorage.getItem(AUTH_STORAGE.REFRESH_TOKEN);
                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    const response = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
                        refreshToken
                    });

                    const { token } = response.data;
                    await AsyncStorage.setItem(AUTH_STORAGE.TOKEN, token);
                    
                    // Update authorization header
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    
                    onRefreshed(token);
                    isRefreshing = false;
                    
                    return api(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    // Clear tokens and reject
                    await AsyncStorage.multiRemove([AUTH_STORAGE.TOKEN, AUTH_STORAGE.REFRESH_TOKEN]);
                    return Promise.reject(refreshError);
                }
            }

            // If refresh is already in progress, wait for it
            return new Promise(resolve => {
                subscribeTokenRefresh(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
            });
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
            if (response.data.accessToken) {
                await AsyncStorage.setItem(AUTH_STORAGE.TOKEN, response.data.accessToken);
            }
            
            if (response.data.user_id) {
                console.log('User ID on login:', response.data.user_id);
                const userIdString = String(response.data.user_id);
                await AsyncStorage.setItem(AUTH_STORAGE.USER_ID, userIdString);
            }

            // Get refresh token from cookies
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                const refreshTokenCookie = cookies.find(cookie => cookie.startsWith('refresh_token='));
                if (refreshTokenCookie) {
                    const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
                    await AsyncStorage.setItem(AUTH_STORAGE.REFRESH_TOKEN, refreshToken);
                }
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
            const token = await AsyncStorage.getItem(AUTH_STORAGE.TOKEN);
            if (!token) {
                throw new Error('No token found');
            }
            const response = await api.post(AUTH_ENDPOINTS.UPDATE_PASSWORD, credentials, {
                headers: {
                    Cookie: `auth_token=${token}`
                }
            });
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Password update failed');
            }
            throw new Error('Network error occurred');
        }
    },

    async getProfile(): Promise<any> {
        try {
            const token = await AsyncStorage.getItem(AUTH_STORAGE.TOKEN);
            if (!token) {
                throw new Error('No token found');
            }
            const response = await api.get(AUTH_ENDPOINTS.PROFILE, {
                headers: {
                    Cookie: `auth_token=${token}`
                }
            });
            console.log('Profile Response:', response.data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch profile');
            }
            throw new Error('Network error occurred');
        }
    }
};