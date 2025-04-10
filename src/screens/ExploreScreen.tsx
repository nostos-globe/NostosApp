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
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mediaService, TripWithMedia } from '../services/mediaService';
import { profileService, Profile } from '../services/profileService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExploreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [publicTrips, setPublicTrips] = useState<TripWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    trips: TripWithMedia[],
    profiles: Profile[]
  }>({ trips: [], profiles: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setShowSearchResults(false);
      return;
    }
    
    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      console.log('Starting search for:', query);
      
      // Call your API endpoints for searching trips and profiles
      const [tripsResults, profilesResults] = await Promise.all([
        mediaService.searchTrips(query),
        profileService.searchProfiles(query)
      ]);
      
      console.log('Search Results - Trips:', JSON.stringify(tripsResults, null, 2));
      console.log('Search Results - Profiles:', JSON.stringify(profilesResults, null, 2));
      
      setSearchResults({
        trips: tripsResults || [],
        profiles: profilesResults || []
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ trips: [], profiles: [] });
    } finally {
      setIsSearching(false);
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
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadPublicTrips().finally(() => setRefreshing(false));
  }, []);

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8BB8E8" />
        </View>
      );
    }

    return (
      <ScrollView style={styles.searchResultsContainer}>
        {searchResults.profiles.length > 0 && (
          <View>
            <Text style={styles.searchSectionTitle}>Profiles</Text>
            {searchResults.profiles.map(profile => (
              <TouchableOpacity 
                key={profile.UserID}
                style={styles.searchResultItem}
                onPress={() => navigation.navigate('OtherProfile', { userId: profile.UserID })}
              >
                <Image 
                  source={{ uri: profile.ProfilePicture || 'https://via.placeholder.com/40' }}
                  style={styles.searchResultAvatar}
                />
                <Text style={styles.searchResultText}>{profile.Username}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchResults.trips.length > 0 && (
          <View>
            <Text style={styles.searchSectionTitle}>Trips</Text>
            {searchResults.trips.map(trip => (
              <TouchableOpacity 
                key={trip.trip.TripID}
                style={styles.searchResultItem}
                onPress={() => navigation.navigate('ExplorePhotoView', {
                  imageUrl: trip.media?.[0]?.url,
                  tripMedia: trip.media || [],
                  initialIndex: 0,
                  trip: trip.trip
                })}
              >
                <Image 
                  source={{ uri: trip.media?.[0]?.url || 'https://via.placeholder.com/50' }}
                  style={styles.searchResultThumbnail}
                />
                <Text style={styles.searchResultText}>{trip.trip.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchResults.profiles.length === 0 && searchResults.trips.length === 0 && (
          <Text style={styles.noResultsText}>No results found</Text>
        )}
      </ScrollView>
    );
  };

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
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8BB8E8']}
            tintColor="#8BB8E8"
          />
        }
      >
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
                  onPress={() => navigation.navigate('ExplorePhotoView', {
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
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trips or profiles..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#666"
        />
      </View>

      {loading && !showSearchResults ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8BB8E8" />
        </View>
      ) : showSearchResults ? (
        renderSearchResults()
      ) : (
        renderMasonryLayout()
      )}

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text>                      
            <Image 
              source={require('../assets/homeIcon.png')}
              style={styles.tabItem}
            />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text>
            <Image 
                source={require('../assets/globeIcon.png')}
                style={styles.tabItem}
              />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Explore' as never)}
        >
          <Text>
            <Image 
                source={require('../assets/findIcon.png')}
                style={styles.tabItem}
            />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabItem, { opacity: 1 }]}
          onPress={() => navigation.navigate('Profile' as never)}
        >
          <Text>
            <Image 
                source={require('../assets/profileIcon.png')}
                style={styles.tabItem}
            />
          </Text>
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
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
  },
  searchResultsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  searchSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  searchResultThumbnail: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  searchResultText: {
    fontSize: 16,
    color: '#000',
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});

export default ExploreScreen;