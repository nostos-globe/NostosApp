import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';

export const configurePushNotifications = () => {
  console.log('Initializing notification configuration...');

  // Configure notifications first
  PushNotification.configure({
    onNotification: function (notification: any) {
      console.log("Received NTFY notification:", notification);
    },
    requestPermissions: Platform.OS === 'ios',
    // Add these required properties
    popInitialNotification: true,
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
  });
  
  if (Platform.OS === 'android') {
    // Check existing channels
    PushNotification.getChannels(channels => {
      console.log('Existing channels:', channels);
      
      // Delete existing channel if any
      if (channels.includes('nostos-notifications')) {
        console.log('Removing existing channel...');
        PushNotification.deleteChannel('nostos-notifications');
      }

      // Create new channel
      console.log('Creating new notification channel...');
      PushNotification.createChannel(
        {
          channelId: "nostos-notifications",
          channelName: "Nostos Notifications",
          channelDescription: "Incoming notifications from Nostos",
          playSound: true,
          soundName: "default",
          importance: Importance.MAX,
          vibrate: true,
          enableLights: true,
          enableVibration: true,
        },
        (created) => {
          console.log('Channel creation result:', created);
          // Verify channel was created
          PushNotification.getChannels(newChannels => {
            console.log('Updated channels:', newChannels);
          });
        }
      );
    });
  }
};

export const showNotification = (title: string, message: string) => {
  console.log('Displaying notification:', { title, message });
  PushNotification.localNotification({
    channelId: "nostos-notifications",
    title,
    message,
    playSound: true,
    soundName: "default",
    importance: "high",
    vibrate: true,
    autoCancel: true,
  });
};