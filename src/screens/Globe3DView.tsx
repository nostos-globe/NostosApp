import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { Globe, globesService, GlobeWithTrips } from '../services/globesService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mediaService, Trip, TripMedia } from '../services/mediaService';
import NavigationBar from '../components/NavigationBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Globe3DView = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [debugMessage, setDebugMessage] = useState<string>('');
  const [globeWithTrips, setGlobeWithTrips] = useState<GlobeWithTrips | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tripLocations, setTripLocations] = useState<Record<string, string[]>>({});
  const [showGlobesList, setShowGlobesList] = useState(false);
  const [userGlobes, setUserGlobes] = useState<Globe[]>([]);
  const [isLoadingGlobes, setIsLoadingGlobes] = useState(false);
  const { globe } = route.params as { 
    globe: Globe,
  };
  // Fetch trips when component mounts
  useEffect(() => {
    fetchTrips();
  }, []);

  // Add this useEffect to fetch globes when the globe list is shown
  useEffect(() => {
    if (showGlobesList) {
      fetchUserGlobes();
    }
  }, [showGlobesList]);

  useEffect(() => {
    if (globeWithTrips?.trips) {
      globeWithTrips.trips.forEach(tripWithMedia => {
        fetchTripLocations(tripWithMedia.trip.TripID.toString());
      });
    }
  }, [globeWithTrips]);

  const fetchUserGlobes = async () => {
    try {
      setIsLoadingGlobes(true);
      const response = await globesService.getMyGlobes();
      console.log('User globes:', response);
      setUserGlobes(response || []);  // Add fallback to empty array
      setIsLoadingGlobes(false);
    } catch (error) {
      console.error('Error fetching user globes:', error);
      setUserGlobes([]);  // Set to empty array on error
      setIsLoadingGlobes(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await globesService.getGlobeByIDWithTrips(globe.AlbumID.toString());
      console.log('Full API Response:', JSON.stringify(response, null, 2));
      console.log('Trips array:', response.trips);
      console.log('First trip details:', response.trips?.[0]);
      setGlobeWithTrips(response);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setDebugMessage(`Error fetching trips: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const fetchTripLocations = async (tripId: string) => {
    try {
      console.log(`Fetching locations for trip ID: ${tripId}`);
      const response = await mediaService.getTripsLocations(tripId);
      console.log(`Locations received for trip ${tripId}:`, response);
      
      setTripLocations(prev => {
        const updated = {
          ...prev,
          [tripId]: response || []
        };
        console.log('Updated trip locations state:', updated);
        return updated as Record<string, string[]>;
      });
    } catch (error) {
      console.error(`Error fetching trip locations for trip ${tripId}:`, error);
    }
  };

  // Update the generateHtml function to use the fetched trips
  const generateHtml = () => {
    const markers = globeWithTrips?.trips?.flatMap(tripWithMedia => 
      tripWithMedia.media?.map(media => ({
        lat: media.latitude || 0,
        lng: media.longitude || 0,
        name: tripWithMedia.trip.name,
        imageUrl: media.url || 'https://picsum.photos/800/600',
        tripId: tripWithMedia.trip.TripID,
        mediaId: media.mediaId
      })) || []
    ) || [];

    // If no markers, show a message in the WebView
    if (markers.length === 0) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                color: #666;
                text-align: center;
                padding: 20px;
              }
            </style>
          </head>
          <body>
            <div>
              <h2>No trips or media available</h2>
              <p>This globe doesn't have any trips with location data yet.</p>
            </div>
          </body>
        </html>
      `;
    }

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
              cursor: pointer;
            }
            .marker-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              transform: translate(-50%, -50%);
              z-index: 1000; /* Added z-index to ensure markers are clickable */
              pointer-events: all; /* Ensure click events are captured */
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
            // Debug logging function.
            const log = (message, data) => {
              console.log(message, data);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'debug',
                message: message,
                data: data
              }));
            };

            try {
              const markers = ${JSON.stringify(markers)};
              log('Initializing globe with markers:', markers);

              // Group markers by location
              const markerGroups = {};
              markers.forEach(marker => {
                const key = \`\${marker.lat},\${marker.lng}\`;
                if (!markerGroups[key]) markerGroups[key] = [];
                markerGroups[key].push(marker);
              });

              let currentZoom = 2.5;
              
              const globe = Globe()
                .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
                .backgroundColor('#f0f0f0')
                .htmlElementsData(markers)
                .htmlElement(d => {
                  const el = document.createElement('div');
                  el.className = 'marker-container';
                  
                  const img = document.createElement('img');
                  img.className = 'marker-img';
                  img.src = d.imageUrl;
                  
                  img.addEventListener('click', () => {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'markerClick',
                      tripId: d.tripId,
                      mediaId: d.mediaId,
                      lat: d.lat,
                      lng: d.lng
                    }));
                  });
                  
                  el.appendChild(img);
                  return el;
                })
                .htmlAltitude(0.02)
                .htmlTransitionDuration(1000);

              const globeInstance = globe(document.getElementById('globe'));
              
              // Handle zoom changes
              globeInstance.controls().addEventListener('change', () => {
                const newZoom = globeInstance.camera().position.z;
                if (Math.abs(newZoom - currentZoom) > 50) {
                  currentZoom = newZoom;
                  updateMarkerPositions(newZoom);
                }
              });

              function updateMarkerPositions(zoom) {
                const spreadFactor = Math.max(0.01, 1 - zoom / 1000);
                
                const updatedMarkers = markers.map(marker => {
                  const group = markerGroups[\`\${marker.lat},\${marker.lng}\`];
                  if (group.length <= 1) return marker;

                  const idx = group.indexOf(marker);
                  const angle = (2 * Math.PI * idx) / group.length;
                  
                  return {
                    ...marker,
                    lat: marker.lat + Math.cos(angle) * spreadFactor,
                    lng: marker.lng + Math.sin(angle) * spreadFactor
                  };
                });

                globeInstance.htmlElementsData(updatedMarkers);
              }

              // Initial setup
              globeInstance.pointOfView({ lat: 30, lng: 0, altitude: 2.2 });
              globeInstance.controls().enableZoom = true;
              globeInstance.controls().autoRotate = true;
              globeInstance.controls().autoRotateSpeed = 0.3;
              globeInstance.controls().enableDamping = true;
              globeInstance.controls().dampingFactor = 0.2;
              
              // Initial marker positions
              updateMarkerPositions(currentZoom);
              
              setTimeout(() => window.dispatchEvent(new Event('resize')), 100);

            } catch (error) {
              console.error('Globe initialization error:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                type: 'error', 
                message: error.message 
              }));
            }
          </script>
        </body>
      </html>
    `;
  };
  const [isListView, setIsListView] = useState(false);
  // Update the handleMessage function to use the fetched trips
  const handleMessage = (event: { nativeEvent: { data: string; }; }) => {
    console.log('Message received from WebView:', event.nativeEvent.data);
    
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'error' || data.type === 'debug') {
        const message = data.type === 'debug' 
          ? `Debug: ${data.message} ${data.data ? JSON.stringify(data.data) : ''}`
          : `Error: ${data.message}`;
        setDebugMessage(message);
        console.log('WebView message:', message);
        return;
      }

      if (data.type === 'markerClick' && data.tripId) {
        // Find the trip in the trips array
        const tripWithMedia = globeWithTrips?.trips
          .find(t => t.trip.TripID === data.tripId);
        
        if (tripWithMedia) {
          const message = `Clicked: ${tripWithMedia.trip.name} (ID: ${data.tripId})`;
          setDebugMessage(message);
          console.log('Navigating to trip:', tripWithMedia.trip.name);
          navigation.navigate('ExplorePhotoView', {
            imageUrl: tripWithMedia.media[0]?.url,
            tripMedia: tripWithMedia.media,
            initialIndex: 0,
            trip: tripWithMedia.trip
          });
        }
      }
    } catch (error) {
      const errorMessage = `Error handling message: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setDebugMessage(errorMessage);
      console.error(errorMessage);
    }
  };

  // Add this function before the return statement
  const getTagColor = (index: number) => {
    const colors = ['#E8F4F8', '#F8E8E8', '#F0F8E8', '#F8F0E8', '#E8E8F8'];
    return colors[index % colors.length];
  };

  const groupTripsByMonth = () => {
    if (!globeWithTrips?.trips) return [];
    
    const grouped: Record<string, any[]> = {};
    
    globeWithTrips.trips.forEach(tripWithMedia => {
      const date = new Date(tripWithMedia.trip.start_date);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      
      grouped[monthYear].push(tripWithMedia);
    });
    
    return Object.entries(grouped).map(([monthYear, trips]) => ({
      monthYear,
      trips,
    }));
  };

  // Add this function to handle the header click
  const handleGlobeHeaderClick = () => {
    setShowGlobesList(!showGlobesList);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGlobeHeaderClick}>
          <View style={styles.headerCard}>
            <Text style={styles.headerText}>{globe.name}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Add delete button */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Delete Globe",
              "Are you sure you want to delete this globe? This action cannot be undone.",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                {
                  text: "Delete",
                  onPress: async () => {
                    try {
                      await globesService.deleteGlobe(globe.AlbumID.toString());
                      navigation.navigate('Home');
                    } catch (error) {
                      console.error('Error deleting globe:', error);
                      Alert.alert("Error", "Failed to delete globe. Please try again.");
                    }
                  }
                }
              ]
            );
          }}
        >
          <Image 
            source={require('../assets/delete_icon.png')}
            style={styles.deleteIcon}
          />
        </TouchableOpacity>
      </View>
      
      {showGlobesList ? (
        <View style={styles.globesListContainer}>
          {isLoadingGlobes ? (
            <Text style={styles.loadingText}>Loading globes...</Text>
          ) : (
            <ScrollView style={styles.globesList}>
              <Text style={styles.globesListTitle}>Your Globes</Text>
              
              {/* Current globe */}
              <TouchableOpacity 
                style={[styles.globeItem, { backgroundColor: '#E8F4F8' }]}
                onPress={() => {
                  setShowGlobesList(false);
                }}
              >
                <Text style={styles.globeName}>{globe.name}</Text>
                <Text style={styles.globeDescription}>Current globe</Text>
              </TouchableOpacity>
              
              {/* Map through all user globes from API */}
              {userGlobes && userGlobes.length > 0 ? (
                userGlobes.map((userGlobe) => (
                  userGlobe.AlbumID !== globe.AlbumID && (
                    <TouchableOpacity 
                      key={userGlobe.AlbumID}
                      style={styles.globeItem}
                      onPress={() => {
                        setShowGlobesList(false);
                        // Navigate to the selected globe with a reset action to ensure data is refreshed
                        navigation.reset({
                          index: 0,
                          routes: [{ 
                            name: 'Globe3DView', 
                            params: { globe: userGlobe } 
                          }],
                        });
                      }}
                    >
                      <Text style={styles.globeName}>{userGlobe.name}</Text>
                      <Text style={styles.globeDescription}>{userGlobe.description || 'No description'}</Text>
                    </TouchableOpacity>
                  )
                ))
              ) : (
                <Text style={styles.emptyListText}>No other globes available</Text>
              )}
              
              <TouchableOpacity 
                style={styles.createGlobeButton}
                onPress={() => {
                  setShowGlobesList(false);
                  navigation.navigate('CreateGlobe');
                }}
              >
                <Text style={styles.createGlobeButtonText}>+ Create New Globe</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      ) : !isListView ? (
        <WebView
          style={styles.webview}
          source={{ html: generateHtml() }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
        />
      ) : (
        <View style={styles.listContainer}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading trips...</Text>
          ) : globeWithTrips?.trips && globeWithTrips.trips.length > 0 ? (
            <ScrollView style={styles.tripsList}>
              {groupTripsByMonth().map(group => (
                <View key={group.monthYear} style={styles.monthGroup}>
                  <Text style={styles.monthHeader}>{group.monthYear}</Text>
                  {group.trips.map((tripWithMedia) => (
                    <TouchableOpacity
                      key={tripWithMedia.trip.TripID}
                      style={styles.tripCard}
                      onPress={() => navigation.navigate('ExplorePhotoView', {
                        imageUrl: tripWithMedia.media?.[0]?.url,
                        tripMedia: tripWithMedia.media || [],
                        initialIndex: 0,
                        trip: tripWithMedia.trip
                      })}
                    >
                      <Image
                        source={{ uri: tripWithMedia.media?.[0]?.url || 'https://picsum.photos/800/600' }}
                        style={styles.tripThumbnail}
                      />
                      <View style={styles.tripDetails}>
                        <View style={styles.tripHeader}>
                          <Text style={styles.tripName}>{tripWithMedia.trip.name}</Text>
                          <TouchableOpacity style={styles.favoriteButton}>
                            <Text>★</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.photoCount}>{tripWithMedia.media?.length || 0} Photos</Text>
                        <View style={styles.locationTags}>
                          {tripLocations[tripWithMedia.trip.TripID] && tripLocations[tripWithMedia.trip.TripID].length > 0 ? (
                            <>
                              {Array.from(new Set(tripLocations[tripWithMedia.trip.TripID].map(location => {
                                if (typeof location === 'object' && location !== null) {
                                  const locObj = location as any;
                                  return [locObj.city, locObj.country].filter(Boolean).join(', ');
                                }
                                return location;
                              })))
                              .slice(0, 3)
                              .map((locationText, index) => (
                                <View 
                                  key={index} 
                                  style={[
                                    styles.locationTag, 
                                    { backgroundColor: getTagColor(index) }
                                  ]}
                                >
                                  <Text style={styles.locationText}>{locationText}</Text>
                                </View>
                              ))}
                            </>
                          ) : (
                            <View style={styles.locationTag}>
                              <Text style={styles.locationText}>Unknown</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyListText}>No trips available</Text>
          )}
        </View>
      )}
      
      <View style={styles.listViewContainer}>
        <TouchableOpacity 
          style={styles.listViewButton}
          onPress={() => setIsListView(!isListView)}
        >
          <View style={[
            styles.toggleBackground,
            isListView ? styles.toggleBackgroundActive : {}
          ]}>
            <View style={[
              styles.toggleCircle, 
              isListView ? styles.toggleCircleActive : {}
            ]}></View>
          </View>
          <Text style={styles.listViewText}>List View</Text>
        </TouchableOpacity>
      </View>
      
      <NavigationBar />
    </View>
  );
};

// StyleSheet definitions.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  headerCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 15,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerPill: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  completedText: {
    fontSize: 14,
    color: '#666',
  },
  webview: {
    flex: 1,
  },
  listViewContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 10,
  },
  listViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 15,
  },
  toggleBackground: {
    width: 40,
    height: 20,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    padding: 0,
  },
  toggleBackgroundActive: {
    backgroundColor: '#4B96F3',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 15,
    borderColor: '#000',
    borderWidth: 0.5,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  listViewText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 10,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabItem: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',

  },
  activeTab: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  tabIcon: {
    fontSize: 20,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    width: 24,
    height: 24,
    tintColor: '#FF6B6B',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#8BB8E8',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  tripsList: {
    flex: 1,
  },
  tripItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 9,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tripThumbnail: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  tripInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  tripDate: {
    fontSize: 14,
    color: '#666',
  },
  monthGroup: {
    marginBottom: 20,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  tripCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1, 
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 0,
  },
  tripDetails: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  favoriteButton: {
    padding: 5,
  },
  photoCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  locationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  globesListContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  globesList: {
    flex: 1,
  },
  globesListTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
  },
  globeItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  globeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  globeDescription: {
    fontSize: 14,
    color: '#666',
  },
  createGlobeButton: {
    backgroundColor: '#8BB8E8',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  createGlobeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Globe3DView;