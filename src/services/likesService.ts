import axios from 'axios';
import { LIKES_API_URL } from '../config/variables';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE } from '../config/variables';

const likesApi = axios.create({
    baseURL: LIKES_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

likesApi.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(AUTH_STORAGE.TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const checkToken = async (): Promise<string | null> => {
    try {
        const token = await AsyncStorage.getItem(AUTH_STORAGE.TOKEN);
        console.log('Current token:', token ? 'exists' : 'not found');
        return token;
    } catch (error) {
        console.error('Error checking token:', error);
        return null;
    }
};

// Update the request interceptor
likesApi.interceptors.request.use(
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



export const likesService = {
    getLikes: async (tripId: string) => {
        const config = await getTokenHeader();
        const response = await likesApi.get(`/api/likes/trip/${tripId}`, config);
        return response.data;
    },
    likeTrip: async (tripId: string) => {
        const config = await getTokenHeader();
        const response = await likesApi.post(`/api/likes/trip/${tripId}`, {}, config);
        return response.data; 
    },
    unlikeTrip: async (tripId: string) => {
        const config = await getTokenHeader();
        const response = await likesApi.delete(`/api/likes/trip/${tripId}`, config);
        return response.data;
    },
    getMediaFavoriteStatus: async (mediaId: string) => {
        const config = await getTokenHeader();
        const response = await likesApi.get(`/api/favourites/media/${mediaId}`, config);
        return response.data; 
    },
    favMedia: async (mediaId: string) => {
        const config = await getTokenHeader();
        const response = await likesApi.post(`/api/favourites/media/${mediaId}`, {}, config);
        return response.data;
    },
    unfavMedia: async (mediaId: string) => {
        const config = await getTokenHeader();
        const response = await likesApi.delete(`/api/favourites/media/${mediaId}`, config);
        return response.data; 
    },
}
