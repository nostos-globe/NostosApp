import axios from 'axios';
import { PROFILE_URL, PROFILE_ENDPOINTS, APP_CONFIG } from '../config/variables';

const api = axios.create({
    baseURL: PROFILE_URL,
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
        console.error('Profile Error:', {
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



export interface Profile {
    id: string;
    username: string;
    bio?: string;
    avatar?: string;
    // Add other profile fields as needed
}

export interface ProfileUpdateData {
    bio?: string;
    avatar?: string;
    // Add other updatable fields
}

export const profileService = {
    async createProfile(profileData: ProfileUpdateData): Promise<Profile> {
        const response = await api.post(PROFILE_ENDPOINTS.CREATE, profileData);
        return response.data;
    },

    async updateProfile(profileData: ProfileUpdateData): Promise<Profile> {
        const response = await api.post(PROFILE_ENDPOINTS.UPDATE, profileData);
        return response.data;
    },

    async updateProfileById(userId: string, profileData: ProfileUpdateData): Promise<Profile> {
        const response = await api.post(PROFILE_ENDPOINTS.UPDATE_BY_ID, { userId, ...profileData });
        return response.data;
    },

    async deleteProfile(): Promise<void> {
        await api.post(PROFILE_ENDPOINTS.DELETE);
    },

    async getProfileById(userId: string): Promise<Profile> {
        const response = await api.get(`${PROFILE_ENDPOINTS.GET_PROFILE}/${userId}`);
        return response.data;
    },

    async getProfileByUsername(username: string): Promise<Profile> {
        const response = await api.get(`${PROFILE_ENDPOINTS.GET_PROFILE_BY_USERNAME}/${username}`);
        return response.data;
    },

    async searchProfiles(query: string): Promise<Profile[]> {
        const response = await api.post(PROFILE_ENDPOINTS.SEARCH, { query });
        return response.data;
    },

    async followUser(followedId: string): Promise<void> {
        await api.post(`${PROFILE_ENDPOINTS.FOLLOW}/${followedId}`);
    },

    async unfollowUser(followedId: string): Promise<void> {
        await api.post(`${PROFILE_ENDPOINTS.UNFOLLOW}/${followedId}`);
    },

    async getFollowers(profileId: string): Promise<Profile[]> {
        const response = await api.get(`${profileId}${PROFILE_ENDPOINTS.LIST_FOLLOWERS}`);
        return response.data;
    },

    async getFollowing(profileId: string): Promise<Profile[]> {
        const response = await api.get(`${profileId}${PROFILE_ENDPOINTS.LIST_FOLLOWING}`);
        return response.data;
    }
};