import axios from 'axios';
import { GLOBES_API_URL } from '../config/variables';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE } from '../config/variables';
import { TripWithMedia } from './mediaService';


export interface Globe {
    AlbumID: number;
    user_id: number;
    name: string;
    description: string;
    creation_date: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';
}

export interface GlobeWithTrips {
    globe: Globe;
    trips: TripWithMedia[];
}

const mediaApi = axios.create({
    baseURL: GLOBES_API_URL,
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


export const globesService = {
    async createGlobe(globeData: {
        name: string;
        description: string;
        visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
      }): Promise<any> {
        const config = await getTokenHeader();
        const response = await mediaApi.post('/api/albums', globeData, config);
        return response.data;
    },

    async deleteGlobe(globeID: string): Promise<void> {
        try {
            const config = await getTokenHeader();
            await mediaApi.delete(`/api/albums/${globeID}`, config);
            console.log(`Media with ID ${globeID} successfully deleted`);
        } catch (error) {
            console.error('Error deleting media:', error);
            throw new Error(`Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    },

    // TODO
    async changeGlobeVisibility(
        mediaId: string, 
        visibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS'
    ): Promise<Globe> {
        const config = await getTokenHeader();
        const response = await mediaApi.put(`/api/media/${mediaId}/visibility`, { visibility }, config);
        return response.data;
    },
    async getMediaVisibility(mediaId: string): Promise<'PUBLIC' | 'PRIVATE' | 'FRIENDS'> {
        const config = await getTokenHeader();
        const response = await mediaApi.get(`/api/media/${mediaId}/visibility`, config);
        return response.data.visibility;
    },

    
    async getGlobeByID(globeID: string): Promise<Globe> {
        const config = await getTokenHeader();
        const response = await mediaApi.get(`/api/albums/${globeID}`,config);
        return response.data;
    },

    async getGlobeByIDWithTrips(globeID: string): Promise<GlobeWithTrips> {
        const config = await getTokenHeader();
        const response = await mediaApi.get(`/api/albums/trips/${globeID}`,config);
        return response.data;
    },

    async getMyGlobes(): Promise<Globe[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get('/api/albums', config);
        return response.data;
    },

    async getMyGlobesWithTrips(): Promise<GlobeWithTrips[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get('/api/albums/trips', config);
        return response.data;
    },

    async getPublicGlobes(): Promise<Globe[]> {
      const config = await getTokenHeader();
      const response = await mediaApi.get('/api/albums/public', config);
      return response.data;
    },

    async getPublicGlobesWithTrips(): Promise<GlobeWithTrips[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get('/api/albums/trips/public', config);
        return response.data;
      },

    async getGlobesByUserId(userId: string): Promise<Globe[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get(`/api/albums/user/${userId}`, config);
        return response.data;
      },

      async getGlobesByUserIdWithTrips(userId: string): Promise<GlobeWithTrips[]> {
        const config = await getTokenHeader();
        const response = await mediaApi.get(`/api/albums/trips/user/${userId}`, config);
        return response.data;
      },
};


