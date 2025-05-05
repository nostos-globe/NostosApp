import axios from 'axios';
import { PROFILE_API_URL } from '../config/variables';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE } from '../config/variables';

export interface Profile {
    ProfileID: number;
    UserID: number;
    User: {
        user_id: number;
        email: string;
        password_hash: string;
        failed_login_attempts: number;
        account_locked: boolean;
        registration_date: string;
    };
    Username: string;
    Bio: string;
    ProfilePicture: string | null;
    Theme: string;
    Location: string;
    Website: string;
    Followers: number;
    Following: number;
    Birthdate: string;
    Language: string;
    PrivacySettings: any | null;
    UpdatedAt: string;
    CreatedAt: string;
}

export interface FollowerFollowing {
    userID: any;
    profileId: number;
    username: string;
    profilePicture: string;
}

export interface FollowResponse {
    Follow: {
        count: number;
        profiles: FollowerFollowing[];
    }
}

// Add this helper function at the top level
const checkToken = async (): Promise<string | null> => {
    try {
        const token = await AsyncStorage.getItem(AUTH_STORAGE.TOKEN);
        return token;
    } catch (error) {
        console.error('Error checking token:', error);
        return null;
    }
};

const profileApi = axios.create({
    baseURL: PROFILE_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Update the request interceptor
profileApi.interceptors.request.use(
    async (config) => {
        const token = await checkToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('No token available for request');
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Update the helper function
const getTokenHeader = async () => {
    const token = await AsyncStorage.getItem(AUTH_STORAGE.TOKEN);
    if (!token) {
        throw new Error('No token found');
    }
    return {
        headers: {
            Cookie: `auth_token=${token}`
        }
    };
};

export const profileService = {
    async createProfile(profileData: Partial<Profile> & { profilePicture?: any }): Promise<Profile> {
        const token = await checkToken();
        if (!token) throw new Error('No token available');
        
        const formData = new FormData();
        
        console.log('Creating profile with data:', profileData);
        
        Object.keys(profileData).forEach(key => {
            if (key === 'ProfilePicture' && profileData[key]) {
                const fileData = {
                    uri: profileData.ProfilePicture,
                    name: 'profile.jpg',
                    type: 'image/jpeg'
                };
                console.log('Appending file:', fileData);
                formData.append('ProfilePicture', fileData);
            } else {
                console.log(`Appending field ${key}:`, profileData[key as keyof typeof profileData]);
                formData.append(key, profileData[key as keyof typeof profileData]);
            }
        });
    
        console.log('Final FormData:', formData);
        
        const response = await axios.post(`${PROFILE_API_URL}/api/profiles`, formData, {
            headers: {
                Cookie: `auth_token=${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('Profile creation response:', response.data);
        return response.data;
    },

    async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
        const config = await getTokenHeader();
        const response = await profileApi.post('/api/profiles/update', profileData, config);
        return response.data;
    },

    async updateProfileById(id: string, profileData: Partial<Profile>): Promise<Profile> {
        const config = await getTokenHeader();
        const response = await profileApi.post('/api/profiles/updateProfileByID', { id, ...profileData }, config);
        return response.data;
    },

    async deleteProfile(): Promise<void> {
        const config = await getTokenHeader();
        await profileApi.post('/api/profiles/delete', {}, config);
    },

    async getProfileById(userId: string): Promise<Profile> {
        const config = await getTokenHeader();
        const response = await profileApi.get(`/api/profiles/user/${userId}`, config);
        return response.data;
    },

    async getProfileByUsername(username: string): Promise<Profile> {
        const config = await getTokenHeader();
        const response = await profileApi.get(`/api/profiles/username/${username}`, config);
        return response.data;
    },

    async searchProfiles(query: string): Promise<Profile[]> {
        const config = await getTokenHeader();
        const response = await profileApi.post('/api/profiles/search', { query }, config);
        return response.data;
    },

    async followUser(followedId: string): Promise<void> {
        const config = await getTokenHeader();
        await profileApi.post(`/api/follow/${followedId}`, {}, config);
    },

    async unfollowUser(followedId: string): Promise<void> {
        const config = await getTokenHeader();
        await profileApi.post(`/api/unfollow/${followedId}`, {}, config);
    },

    async getFollowers(profileId: string): Promise<FollowResponse> {
        const config = await getTokenHeader();
        const response = await profileApi.get(`/api/${profileId}/followers`, config);
        return response.data;
    },

    async getFollowing(profileId: string): Promise<FollowResponse> {
        const config = await getTokenHeader();
        const response = await profileApi.get(`/api/${profileId}/following`, config);
        return response.data;
    }
};