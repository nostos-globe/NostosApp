import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { globesService } from '../services/globesService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trip, TripMedia } from '../services/mediaService';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Globe3DView = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute();
  
  // Test data
  const testTrips = [
    {
      trip: {
        TripID: 2,
        latitude: "48.8566",
        longitude: "2.3522",
        name: "Paris Adventure",
        user_id: 1,
        description: "Trip to Paris",
        start_date: "2024-01-01",
        end_date: "2024-01-07",
        visibility: "PUBLIC" as const
      },
      media: [{ 
        url: "https://picsum.photos/800/600",
        mediaId: 2
      }]
    },
    {
      trip: {
        TripID: 3,
        latitude: "28.8566",
        longitude: "2.3522",
        name: "Paris Adventure",
        user_id: 1,
        description: "Another Paris trip",
        start_date: "2024-02-01",
        end_date: "2024-02-07",
        visibility: "PUBLIC" as const
      },
      media: [{ 
        url: "https://picsum.photos/800/600",
        mediaId: 3
      }]
    },
    {
      trip: {
        TripID: 1,
        latitude: "51.5074",
        longitude: "-0.1278",
        name: "London Experience",
        user_id: 1,
        description: "Trip to London",
        start_date: "2024-03-01",
        end_date: "2024-03-07",
        visibility: "PUBLIC" as const
      },
      media: [{ 
        url: "https://picsum.photos/800/600",
        mediaId: 1
      }]
    }
  ];

  const generateHtml = () => {
    const markers = testTrips.map(trip => ({
      lat: parseFloat(trip.trip.latitude),
      lng: parseFloat(trip.trip.longitude),
      name: trip.trip.name,
      imageUrl: trip.media[0].url,
      tripId: trip.trip.TripID // Add tripId to make identification easier
    }));

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            body { margin: 0; overflow: hidden; }
            #globe { width: 100vw; height: 100vh; }
            .marker-label {
              padding: 6px 8px;
              border-radius: 10px;
              background: rgba(0,0,0,0.7);
              color: white;
              font-size: 14px;
              text-align: center;
              margin-top: 5px;
              white-space: nowrap;
            }
            .marker-img {
              width: 30px;
              height: 40px;
              border-radius: 12px;
              border: 3px solid white;
              box-shadow: 0 3px 6px rgba(0,0,0,0.4);
              object-fit: cover;
              transition: transform 0.2s ease;
            }
            .marker-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              transform: translate(-50%, -50%);
            }
            .marker-container:hover .marker-img {
              transform: scale(1.1);
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/globe.gl@2.26.3/dist/globe.gl.min.js"></script>
        </head>
        <body>
          <div id="globe"></div>
          <script>
            try {
              const markers = ${JSON.stringify(markers)};
              const globe = Globe()
                .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
                .backgroundColor('#fff')
                .htmlElementsData(markers)
                .htmlElement(d => {
                  const el = document.createElement('div');
                  el.className = 'marker-container';
                  el.innerHTML = \`
                    <img class="marker-img" src="\${d.imageUrl}" />
                    <div class="marker-label">\${d.name}</div>
                  \`;
                  el.style.cursor = 'pointer';
                  el.onclick = () => {
                    // Log to console for debugging
                    console.log('Marker clicked:', d);
                    
                    // Send message immediately without animation delay
                    try {
                      const message = JSON.stringify({
                        lat: d.lat,
                        lng: d.lng,
                        tripId: d.tripId
                      });
                      console.log('Sending message to React Native:', message);
                      window.ReactNativeWebView.postMessage(message);
                    } catch (err) {
                      console.error('Error sending message:', err);
                    }
                    
                    // Animate to marker position
                    globe.pointOfView({
                      lat: d.lat,
                      lng: d.lng,
                      altitude: 0.005
                    }, 1000);
                  };
                  return el;
                })
                .htmlAltitude(0.01)
                .htmlTransitionDuration(1000);

              // Initialize with custom rotation
              globe(document.getElementById('globe'))
                .pointOfView({
                  lat: 20, 
                  lng: 0,
                  altitude: 3.05
                });

              // Smoother auto-rotation
              globe.controls().autoRotate = true;
              globe.controls().autoRotateSpeed = 0.35;
              globe.controls().enableZoom = true;
              
              console.log('Globe initialized successfully');
            } catch (error) {
              console.error('Globe initialization error:', error);
              document.body.innerHTML = '<div style="color:red;padding:20px;">Error loading globe: ' + error.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;
  };

  const handleMessage = (event: { nativeEvent: { data: string; }; }) => {
    console.log('Message received from WebView:', event.nativeEvent.data);
    
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // First try to find by tripId if available
      let trip = data.tripId ? 
        testTrips.find(t => t.trip.TripID === data.tripId) : 
        null;
      
      // If not found by ID, try coordinates
      if (!trip && data.lat && data.lng) {
        trip = testTrips.find(t => {
          const latDiff = Math.abs(parseFloat(t.trip.latitude) - data.lat);
          const lngDiff = Math.abs(parseFloat(t.trip.longitude) - data.lng);
          return latDiff < 0.001 && lngDiff < 0.001;
        });
      }
      
      if (trip) {
        console.log('Trip found:', trip.trip.name);
        navigation.navigate('ExplorePhotoView', {
          imageUrl: trip.media[0].url,
          tripMedia: trip.media,
          initialIndex: 1,
          trip: trip.trip
        });
      } else {
        console.log('No matching trip found for data:', data);
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Personal Globe</Text>
        <TouchableOpacity style={styles.listViewButton}>
          <Text style={styles.listViewText}>List View</Text>
        </TouchableOpacity>
      </View>
      
      <WebView
        style={styles.webview}
        source={{ html: generateHtml() }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        onError={(e) => console.error('WebView error:', e.nativeEvent)}
        onHttpError={(e) => console.error('WebView HTTP error:', e.nativeEvent)}
      />
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>🌎</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Explore' as never)}
        >
          <Text>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabItem, { opacity: 1 }]}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          <Text>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  listViewButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 15,
  },
  listViewText: {
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navItem: {
    alignItems: 'center',
    padding: 10,
  },
  navIcon: {
    fontSize: 24,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: '#8BB8E8',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
});

export default Globe3DView;