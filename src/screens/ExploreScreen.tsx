import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mediaService, TripWithMedia } from '../services/mediaService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExploreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [publicTrips, setPublicTrips] = useState<TripWithMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicTrips();
  }, []);

  const loadPublicTrips = async () => {
    try {
      setLoading(true);
      const trips = await mediaService.getPublicTrips();
      console.log('Public trips from API:', JSON.stringify(trips));
      setPublicTrips(trips || []);
    } catch (error) {
      console.error('Error loading public trips:', error);
      setPublicTrips([]);
    } finally {
      setLoading(false);
    }
  };

  // Create a masonry layout with varying heights
  const renderMasonryLayout = () => {
    if (publicTrips.length === 0) {
      return (
        <View style={styles.noTripsContainer}>
          <Text style={styles.noTripsText}>No public trips found</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.masonryContainer}>
          {/* First column */}
          <View style={styles.masonryColumn}>
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 180, backgroundColor: '#6979F8' }]}
              onPress={() => publicTrips[0] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[0].media[0]?.url,
                tripMedia: publicTrips[0].media || [],
                initialIndex: 0,
                trip: publicTrips[0].trip
              })}
            >
              {publicTrips[0]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[0].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 220, backgroundColor: '#BE6ADE' }]}
              onPress={() => publicTrips[1] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[1].media[0]?.url,
                tripMedia: publicTrips[1].media || [],
                initialIndex: 0,
                trip: publicTrips[1].trip
              })}
            >
              {publicTrips[1]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[1].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 120, backgroundColor: '#A0A8CD' }]}
              onPress={() => publicTrips[2] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[2].media[0]?.url,
                tripMedia: publicTrips[2].media || [],
                initialIndex: 0,
                trip: publicTrips[2].trip
              })}
            >
              {publicTrips[2]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[2].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 150, backgroundColor: '#AEDCC0' }]}
              onPress={() => publicTrips[3] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[3].media[0]?.url,
                tripMedia: publicTrips[3].media || [],
                initialIndex: 0,
                trip: publicTrips[3].trip
              })}
            >
              {publicTrips[3]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[3].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}

            </TouchableOpacity>
          </View>
          
          {/* Second column */}
          <View style={styles.masonryColumn}>
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 300, backgroundColor: '#E07A7A' }]}
              onPress={() => publicTrips[4] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[4].media[0]?.url,
                tripMedia: publicTrips[4].media || [],
                initialIndex: 0,
                trip: publicTrips[4].trip
              })}
            >
              {publicTrips[4]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[4].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}

            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 180, backgroundColor: '#D8E0A3' }]}
              onPress={() => publicTrips[5] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[5].media[0]?.url,
                tripMedia: publicTrips[5].media || [],
                initialIndex: 0,
                trip: publicTrips[5].trip
              })}
            >
              {publicTrips[5]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[5].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}

            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 150, backgroundColor: '#1A4B8C' }]}
              onPress={() => publicTrips[6] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[6].media[0]?.url,
                tripMedia: publicTrips[6].media || [],
                initialIndex: 0,
                trip: publicTrips[6].trip
              })}
            >
              {publicTrips[6]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[6].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}

            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 120, backgroundColor: '#FFCC66' }]}
              onPress={() => publicTrips[7] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[7].media[0]?.url,
                tripMedia: publicTrips[7].media || [],
                initialIndex: 0,
                trip: publicTrips[7].trip
              })}
            >
              {publicTrips[7]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[7].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}

            </TouchableOpacity>
          </View>
          
          {/* Third column */}
          <View style={styles.masonryColumn}>
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 180, backgroundColor: '#3D3D3D' }]}
              onPress={() => publicTrips[8] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[8].media[0]?.url,
                tripMedia: publicTrips[8].media || [],
                initialIndex: 0,
                trip: publicTrips[8].trip
              })}
            >
              {publicTrips[8]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[8].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.tripOverlay}>
                <Text style={styles.tripName}>{publicTrips[8]?.trip.name}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 250, backgroundColor: '#4CAF50' }]}
              onPress={() => publicTrips[9] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[9].media[0]?.url,
                tripMedia: publicTrips[9].media || [],
                initialIndex: 0,
                trip: publicTrips[9].trip
              })}
            >
              {publicTrips[9]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[9].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}

            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.masonryItem, { height: 180, backgroundColor: '#E6C7C7' }]}
              onPress={() => publicTrips[10] && navigation.navigate('PhotoView', {
                imageUrl: publicTrips[10].media[0]?.url,
                tripMedia: publicTrips[10].media || [],
                initialIndex: 0,
                trip: publicTrips[10].trip
              })}
            >
              {publicTrips[10]?.media?.[0]?.url && (
                <Image 
                  source={{ uri: publicTrips[10].media[0].url }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              )}

            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8BB8E8" />
        </View>
      ) : (
        renderMasonryLayout()
      )}

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home')}
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
          style={[styles.tabItem, { opacity: 1 }]}
          disabled={true}
        >
          <Text>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text>👤</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  masonryContainer: {
    flexDirection: 'row',
    padding: 2,
  },
  masonryColumn: {
    flex: 1,
    padding: 2,
  },
  masonryItem: {
    margin: 2,
    borderRadius: 0,
    overflow: 'hidden',
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  tripOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
  },
  tripName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediaCount: {
    color: '#ddd',
    fontSize: 12,
  },
  noTripsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noTripsText: {
    fontSize: 16,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
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

export default ExploreScreen;