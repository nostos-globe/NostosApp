import axios from 'axios';
import { PROFILE_API_URL } from '../config/variables';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE } from '../config/variables';

export interface Profile {
    id: string;
    user_id: string;
    username: string;
    bio: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

const profileApi = axios.create({
    baseURL: PROFILE_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
profileApi.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(AUTH_STORAGE.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const profileService = {
    async createProfile(profileData: Partial<Profile>): Promise<Profile> {
        const response = await profileApi.post('/api/profiles', profileData);
        return response.data;
    },

    async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
        const response = await profileApi.post('/api/profiles/update', profileData);
        return response.data;
    },

    async updateProfileById(id: string, profileData: Partial<Profile>): Promise<Profile> {
        const response = await profileApi.post('/api/profiles/updateProfileByID', { id, ...profileData });
        return response.data;
    },

    async deleteProfile(): Promise<void> {
        await profileApi.post('/api/profiles/delete');
    },

    async getProfileById(userId: string): Promise<Profile> {
        const response = await profileApi.get(`/api/profiles/user/${userId}`);
        return response.data;
    },

    async getProfileByUsername(username: string): Promise<Profile> {
        const response = await profileApi.get(`/api/profiles/username/${username}`);
        return response.data;
    },

    async searchProfiles(query: string): Promise<Profile[]> {
        const response = await profileApi.post('/api/profiles/search', { query });
        return response.data;
    },

    async followUser(followedId: string): Promise<void> {
        await profileApi.post(`/api/follow/${followedId}`);
    },

    async unfollowUser(followedId: string): Promise<void> {
        await profileApi.post(`/api/unfollow/${followedId}`);
    },

    async getFollowers(profileId: string): Promise<Profile[]> {
        const response = await profileApi.get(`/api/${profileId}/followers`);
        return response.data;
    },

    async getFollowing(profileId: string): Promise<Profile[]> {
        const response = await profileApi.get(`/api/${profileId}/following`);
        return response.data;
    }
};