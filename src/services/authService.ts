import axios from 'axios';
import { API_URL, AUTH_ENDPOINTS, APP_CONFIG } from '../config/variables';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
    baseURL: API_URL,
    timeout: APP_CONFIG.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// Add cookie parser helper
const parseCookies = (cookieHeader: string) => {
    return cookieHeader.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.split('=').map(c => c.trim());
        cookies[name] = value;
        return cookies;
    }, {} as Record<string, string>);
};

api.interceptors.response.use(
    (response) => {
        const cookies = response.headers['set-cookie'];
        if (cookies) {
            const authToken = cookies.find(cookie => cookie.includes('auth_token='));
            if (authToken) {
                api.defaults.headers.common['Cookie'] = authToken;
            }
        }
        return response;
    },
    (error) => {
        console.error('Auth Error:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });
        return Promise.reject(error);
    }
);

api.interceptors.request.use(
    (config) => {
        config.withCredentials = true;
        // Ensure cookies are sent with every request
        if (api.defaults.headers.common['Cookie']) {
            config.headers['Cookie'] = api.defaults.headers.common['Cookie'];
        }
        console.log('Request headers:', config.headers);
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.request.use(
    (config) => {
        // Add credentials mode for cookie handling
        config.withCredentials = true;
        console.log('Auth Request:', {
            url: config.url,
            headers: config.headers,
            withCredentials: config.withCredentials
        });
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        console.log('Auth Response:', {
            status: response.status,
            headers: response.headers,
            cookies: response.headers['set-cookie']
        });
        return response;
    },
    (error) => {
        console.error('Auth Error:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });
        return Promise.reject(error);
    }
);

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

// Basic response interceptor without token refresh
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export interface CurrentUser{
    message: string;
    user: {
        account_locked: boolean;
        email: string;
        failed_login_attempts: number;
        registration_date: string;
        user_id: string;
    };
}

export interface UserCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    id: any;
    user: {
        id: string;
        email: string;
    };
}

export const authService = {
    async login(credentials: UserCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
            
            // Store token securely
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                const authToken = cookies.find(cookie => cookie.includes('auth_token='));
                if (authToken) {
                    const token = authToken.split(';')[0].split('=')[1];
                    await SecureStore.setItemAsync('auth_token', token);
                    api.defaults.headers.common['Cookie'] = `auth_token=${token}`;
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
            await SecureStore.deleteItemAsync('auth_token');
            delete api.defaults.headers.common['Cookie'];
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    },

    async getCurrentUser(): Promise<CurrentUser> {
        try {
            const response = await api.get(AUTH_ENDPOINTS.PROFILE);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to fetch current user');
            }
            throw new Error('Network error occurred');
        }
    }   
};

// Update the request interceptor to use SecureStore
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            if (token) {
                config.headers.Cookie = `auth_token=${token}`;
            }
        } catch (error) {
            console.error('Error accessing token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);