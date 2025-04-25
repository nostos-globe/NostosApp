import { useEffect } from 'react';
import { showNotification } from '../config/notificationConfig';
import base64 from 'react-native-base64';

const NTFY_URL = 'https://notifications.nostos-globe.me';
const TOPIC = 'testing';
const USERNAME = 'ntfyuser';
const PASSWORD = '123456';

const POLL_INTERVAL = 5000;

export function useNtfyNotifications(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    async function checkNotifications() {
      try {
        console.log('Checking for notifications...');
        
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Basic ' + base64.encode(`${USERNAME}:${PASSWORD}`));
 
        const response = await fetch(`${NTFY_URL}/${TOPIC}/json`, {
          method: 'GET',
          headers: headers,
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const lastMessage = data[data.length - 1];
            if (lastMessage.message) {
              console.log('New notification:', lastMessage.message);
              showNotification('Nostos', lastMessage.message);
            }
          }
        } else {
          console.error('Server response error:', response.status);
        }
      } catch (err) {
        console.error('Fetch error:', {
          message: err.message,
          name: err.name
        });
      }
    }

    console.log('Starting notification service');
    checkNotifications();
    const interval = setInterval(checkNotifications, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [enabled]);
}