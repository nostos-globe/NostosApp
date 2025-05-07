import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mediaService } from '../services/mediaService';

const MapPickerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mediaId, viewOnly } = route.params as { mediaId: string; viewOnly?: boolean };

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; }
          body { margin: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([40.4168, -3.7038], 5);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          let marker;
          
          map.on('click', function(e) {
            if (!marker) {
              marker = L.marker(e.latlng, {draggable: true}).addTo(map);
            } else {
              marker.setLatLng(e.latlng);
            }
            window.ReactNativeWebView.postMessage(JSON.stringify(e.latlng));
          });
        </script>
      </body>
    </html>
  `;

  const handleMapMessage = (event: any) => {
    const location = JSON.parse(event.nativeEvent.data);
    setSelectedLocation({
      latitude: location.lat,
      longitude: location.lng
    });
  };

  const handleConfirm = async () => {
    if (!selectedLocation || viewOnly) {
      return;
    }

    try {
      // Get media data first
      const mediaData = await mediaService.getMediaById(mediaId);
      console.log('Current media data:', JSON.stringify(mediaData, null, 2));

      // Add metadata
      const response = await mediaService.addMetadataToMedia(mediaId, {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        altitude: 0,
      });
        console.log('Update metadata response:', JSON.stringify(response, null, 2));


navigation.goBack();
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {viewOnly ? 'Photo Location' : 'Select Location'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <WebView
        style={styles.map}
        source={{ html: mapHTML }}
        onMessage={handleMapMessage}
      />

      {!viewOnly && (
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedLocation && styles.disabledButton
          ]}
          onPress={handleConfirm}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#8BB8E8',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapPickerScreen;