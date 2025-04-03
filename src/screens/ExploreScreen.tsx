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

  const cardStyles = [
    { height: 180, flex: 1 },
    { height: 250, flex: 1 },
    { height: 200, flex: 1 },
    { height: 120, flex: 1 },
    { height: 220, flex: 1 },
    { height: 160, flex: 1 },
  ];
  
  const renderMasonryLayout = () => {
    if (publicTrips.length === 0) {
      return (
        <View style={styles.noTripsContainer}>
          <Text style={styles.noTripsText}>No public trips found</Text>
        </View>
      );
    }

    // Organize trips into three columns
    const columns: TripWithMedia[][] = [[], [], []];
    publicTrips.forEach((trip, index) => {
      columns[index % 3].push(trip);
    });

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.masonryContainer}>
          {columns.map((column, columnIndex) => (
            <View key={columnIndex} style={styles.masonryColumn}>
              {column.map((trip, index) => (
                <TouchableOpacity 
                  key={trip.trip.TripID}
                  style={[
                    styles.masonryItem, 
                    cardStyles[(index * columnIndex + index * 2) % cardStyles.length],
                    { backgroundColor: '#E0E0E0' }
                  ]}
                  onPress={() => navigation.navigate('PhotoView', {
                    imageUrl: trip.media?.[0]?.url,
                    tripMedia: trip.media || [],
                    initialIndex: 0,
                    trip: trip.trip
                  })}
                >
                  {trip.media?.[0]?.url && (
                    <Image 
                      source={{ uri: trip.media[0].url }}
                      style={styles.tripImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.tripOverlay}>
                    <Text style={styles.tripName}>{trip.trip.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
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
    paddingBottom: 80, // Add padding for tab bar
  },
  masonryContainer: {
    flexDirection: 'row',
    padding: 2,
    paddingBottom: 16, // Add some space at the bottom of the masonry layout
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