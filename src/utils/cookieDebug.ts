import axios from 'axios';
import { PROFILE_URL, API_URL } from '../config/variables';

export const checkCookies = async () => {
    try {
        // Check auth cookies
        const authResponse = await axios.get(`${API_URL}/check-cookies`, {
            withCredentials: true
        });
        console.log('Auth cookies:', {
            headers: authResponse.headers,
            cookies: authResponse.headers['set-cookie']
        });

        // Check profile cookies
        const profileResponse = await axios.get(`${PROFILE_URL}/check-cookies`, {
            withCredentials: true
        });
        console.log('Profile cookies:', {
            headers: profileResponse.headers,
            cookies: profileResponse.headers['set-cookie']
        });
    } catch (error) {
        console.error('Cookie check failed:', error);
    }
};