import axios from 'axios';
import { MEDIA_API_URL } from '../config/variables';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE } from '../config/variables';

export interface MediaMetadata {
    location?: string;
    caption?: string;
    tags?: string[];
    date?: string;
}

export interface MediaItem {
    media_id: string;
    trip_id: string;
    url: string;
    type: string;
    metadata?: MediaMetadata;
    visibility: 'public' | 'private' | 'followers';
    created_at: string;
}

export interface TripMedia {
    mediaId: number;
    url: string;
}

export interface Trip {
    TripID: number;
    user_id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';
}

export interface TripWithMedia {
    media: TripMedia[];
    trip: Trip;
}

const mediaApi = axios.create({
    baseURL: MEDIA_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
});

mediaApi.interceptors.request.use(
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
mediaApi.interceptors.request.use(
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


export const mediaService = {
    async uploadMediaToTrip(tripId: string, file: FormData): Promise<MediaItem> {
        const response = await mediaApi.post(`/api/media/trip/${tripId}`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },

    async getMediaUrl(mediaId: string): Promise<string> {
        const response = await mediaApi.get(`/api/media/${mediaId}`);
        return response.data.url;
    },

    async deleteMedia(mediaId: string): Promise<void> {
        await mediaApi.delete(`/api/media/${mediaId}`);
    },

    async addMetadataToMedia(mediaId: string, metadata: MediaMetadata): Promise<MediaItem> {
        const response = await mediaApi.post(`/api/media/${mediaId}/metadata`, metadata);
        return response.data;
    },

    async changeMediaVisibility(
        mediaId: string, 
        visibility: 'public' | 'private' | 'followers'
    ): Promise<MediaItem> {
        const response = await mediaApi.put(`/api/media/${mediaId}/visibility`, { visibility });
        return response.data;
    },

    async getMediaByTripId(tripId: string): Promise<MediaItem[]> {
        const response = await mediaApi.get(`/api/media/trip/${tripId}`);
        return response.data;
    },

    async getTripMedia(tripId: string): Promise<TripMedia[]> {
        const response = await mediaApi.get(`/api/media/trip/${tripId}`);
        return response.data;
    },

    async getMyTrips(): Promise<TripWithMedia[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get('/api/trips/myTrips', config);
        return response.data;
    },

    async getPublicTrips(): Promise<TripWithMedia[]> {
      const config = await getTokenHeader();
      const response = await mediaApi.get('/api/trips/public', config);
      return response.data;
    },

    async uploadTripMedia(tripId: string, file: FormData): Promise<TripMedia> {
        const response = await mediaApi.post(`/api/media/trip/${tripId}`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    }
};