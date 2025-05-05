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

export interface Location {
    Country: string;
    City: string;
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
    latitude: number;
    longitude: number;
    visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';
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
    location: string;
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
        const token = await AsyncStorage.getItem(AUTH_STORAGE.TOKEN);
        if (!token) {
            throw new Error('No token found');
        }
        const response = await mediaApi.post(`/api/media/trip/${tripId}`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Cookie: `auth_token=${token}`
            }
        });
        return response.data;
    },

    async deleteMedia(mediaId: string): Promise<void> {
        try {
            const config = await getTokenHeader();
            await mediaApi.delete(`/api/media/${mediaId}`, config);
            console.log(`Media with ID ${mediaId} successfully deleted`);
        } catch (error) {
            console.error('Error deleting media:', error);
            throw new Error(`Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    async addMetadataToMedia(mediaId: string, metadata: MediaMetadata): Promise<MediaItem> {
        const response = await mediaApi.post(`/api/media/${mediaId}/metadata`, metadata);
        return response.data;
    },

    async getTripsLocations(tripId: string): Promise<TripWithMedia> {
        const config = await getTokenHeader();
        const response = await mediaApi.get(`/api/trips/${tripId}/locations`, config);
        return response.data; 
    },

    async changeMediaVisibility(
        mediaId: string, 
        visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS'
    ): Promise<Location> {
        const config = await getTokenHeader();
        const response = await mediaApi.put(`/api/media/${mediaId}/visibility`, { visibility }, config);
        return response.data;
    },

    async getMediaVisibility(mediaId: string): Promise<'PUBLIC' | 'PRIVATE' | 'FRIENDS'> {
        const config = await getTokenHeader();
        const response = await mediaApi.get(`/api/media/${mediaId}/visibility`, config);
        return response.data.visibility;
    },

    async getTripMedia(tripId: string): Promise<TripWithMedia[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get(`/api/media/trip/${tripId}`,config);
        return response.data;
    },

    async getMyTrips(): Promise<TripWithMedia[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get('/api/trips/myTrips', config);
        return response.data;
    },
    
    async getLikedTrips(): Promise<TripWithMedia[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get('/api/trips/myLikedTrips', config);
        return response.data;
    },

    async searchTrips(query: string): Promise<TripWithMedia[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.post('/api/trips/search', { query }, config);
        return response.data;
    },

    async getPublicTrips(): Promise<TripWithMedia[]> {
      const config = await getTokenHeader();
      const response = await mediaApi.get('/api/trips/public', config);
      return response.data;
    },

    async getTripsByUserId(userId: string): Promise<TripWithMedia[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get(`/api/trips/user/${userId}`, config);
        return response.data;
      },

    async getFollowingTrips(): Promise<TripWithMedia[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get('/api/trips/following', config);
        return response.data;
      },

    async uploadTripMedia(tripId: string, file: FormData): Promise<TripMedia> {
        const response = await mediaApi.post(`/api/media/trip/${tripId}`, file, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    },
    

    async createTrip(tripData: {
        name: string;
        description: string;
        visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
        start_date: string;
        end_date: string;
        album_id?: string;
      }): Promise<any> {
        const config = await getTokenHeader();
        const response = await mediaApi.post('/api/trips', tripData, config);
        return response.data;
      },
};


// Add this function to your mediaService.ts file

export const uploadMediaToTrip = async (tripId: string, imageUri: string): Promise<MediaItem> => {
  try {
    // Create a FormData object to send the image
    const formData = new FormData();
    
    // Get the file name from the URI
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // Append the image to the form data
    formData.append('media', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg', // You might want to detect this dynamically
    } as any);
    
    // Use the existing mediaService method instead of creating a new fetch call
    return await mediaService.uploadMediaToTrip(tripId, formData);
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};

