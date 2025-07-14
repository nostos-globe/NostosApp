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
import NavigationBar from '../components/NavigationBar';
import CustomTextRegular from '../components/CustomTextRegular';
import CustomTextBold from '../components/CustomTextBold';

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
      console.log(`Retrieved ${trips?.length || 0} public trips`);
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

      // Call your API endpoints for searching trips and profiles
      const [tripsResults, profilesResults] = await Promise.all([
        mediaService.searchTrips(query),
        profileService.searchProfiles(query)
      ]);

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
            <CustomTextBold style={styles.searchSectionTitle}>Profiles</CustomTextBold>
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
                <CustomTextRegular style={styles.searchResultText}>{profile.Username}</CustomTextRegular>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchResults.trips.length > 0 && (
          <View>
            <CustomTextBold style={styles.searchSectionTitle}>Trips</CustomTextBold>
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
                <CustomTextRegular style={styles.searchResultText}>{trip.trip.name}</CustomTextRegular>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {searchResults.profiles.length === 0 && searchResults.trips.length === 0 && (
          <CustomTextRegular style={styles.noResultsText}>No results found</CustomTextRegular>
        )}
      </ScrollView>
    );
  };

  const renderMasonryLayout = () => {
    if (publicTrips.length === 0) {
      return (
        <View style={styles.noTripsContainer}>
          <CustomTextRegular style={styles.noTripsText}>No public trips found</CustomTextRegular>
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
                    <CustomTextRegular style={styles.tripName}>{trip.trip.name}</CustomTextRegular>
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
        <CustomTextBold style={styles.headerTitle}>Explore</CustomTextBold>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trips or profiles..."
          placeholderTextColor="#B3B3B3"
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

    <NavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 60,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
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
    width: 30,
    height: 30,
    alignItems: 'center',
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
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f5f5f5',
    fontFamily:'OutfitRegular',
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