import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mediaService, TripWithMedia } from '../services/mediaService';
import { profileService } from '../services/profileService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { globesService, Globe } from '../services/globesService';
import { likesService } from '../services/likesService';
import NavigationBar from '../components/NavigationBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [followingTrips, setFollowingTrips] = useState<TripWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: string}>({});
  const [myGlobes, setMyGlobes] = useState<Globe[]>([]);
  const [loadingGlobes, setLoadingGlobes] = useState(true);
  const [tripLikes, setTripLikes] = useState<{[key: string]: number}>({});
  const [likedTrips, setLikedTrips] = useState<{[key: string]: boolean}>({});

  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await profileService.getProfileById(userId);
      setUserProfiles(prev => ({
        ...prev,
        [userId]: profile.ProfilePicture || 'https://via.placeholder.com/40'
      }));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchFollowingTrips = async () => {
    try {
      setLoading(true);
      const trips = await mediaService.getFollowingTrips();
      const filteredTrips = trips?.filter(trip => trip.trip.user_id !== 1) || [];
      setFollowingTrips(filteredTrips);
    } catch (error) {
      console.error('Error fetching following trips:', error);
      setFollowingTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (tripId: string) => {
    try {
      if (likedTrips[tripId]) {
        await likesService.unlikeTrip(tripId);
        setLikedTrips(prev => ({...prev, [tripId]: false}));
        setTripLikes(prev => ({...prev, [tripId]: (prev[tripId] || 1) - 1}));
      } else {
        await likesService.likeTrip(tripId);
        setLikedTrips(prev => ({...prev, [tripId]: true}));
        setTripLikes(prev => ({...prev, [tripId]: (prev[tripId] || 0) + 1}));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const fetchTripLikes = async (tripId: string) => {
    try {
      const likesData = await likesService.getLikes(tripId);
      console.log('Likes data for trip', tripId, ':', likesData);
      
      // Update total likes count
      setTripLikes(prev => ({
        ...prev,
        [tripId]: likesData.total_likes || 0
      }));
      
      // Check if the current user has liked this trip by checking if their profile is in the profiles array
      const hasUserLiked = likesData.profiles && likesData.profiles.length > 0;
      
      setLikedTrips(prev => ({
        ...prev,
        [tripId]: hasUserLiked
      }));
    } catch (error) {
      console.error('Error fetching likes for trip:', tripId, error);
    }
  };

  const fetchMyGlobes = async () => {
    try {
      setLoadingGlobes(true);
      const globes = await globesService.getMyGlobes();
      setMyGlobes(globes);
    } catch (error) {
      console.error('Error fetching globes:', error);
      setMyGlobes([]);
    } finally {
      setLoadingGlobes(false);
    }
  };

  useEffect(() => {
    fetchMyGlobes();
    fetchFollowingTrips();
  }, []);

  useEffect(() => {
    if (followingTrips.length > 0) {
      followingTrips.forEach(trip => {
        if (trip.trip.user_id) {
          fetchUserProfile(trip.trip.user_id.toString());
        }
        fetchTripLikes(trip.trip.TripID.toString());
      });
    }
  }, [followingTrips]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Globes</Text>
        <TouchableOpacity>
          <Image 
            source={require('../assets/notifications_icon.png')}
            style={styles.tabItem}
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.globesScroll}
        >
          {/* Create New Globe Card */}
          <TouchableOpacity 
            style={styles.createGlobeItem}
            onPress={() => navigation.navigate('CreateGlobe')}
          >
            <View style={styles.createGlobePlaceholder}>
              <View style={styles.createGlobeContent}>
                <View style={styles.createGlobeIconWrapper}>
                  <Text style={styles.createGlobeIcon}>+</Text>
                </View>
                <Text style={styles.createGlobeText}>Create a new Globe</Text>
              </View>
            </View>
          </TouchableOpacity>

          {loadingGlobes ? (
            <ActivityIndicator size="large" color="#8BB8E8" />
          ) : (
            myGlobes.map((globe) => (
              <TouchableOpacity 
                key={globe.AlbumID} 
                style={[styles.createGlobeItem]}
                onPress={() => navigation.navigate('Globe3DView', { globe })}
              >
                <View style={[styles.globePlaceholder, { backgroundColor: getRandomColor() }]}>
                  <View style={styles.globeContent}>
                    <View style={styles.globeIconWrapper}>
                      <Text style={styles.globeIcon}>🌍</Text>
                    </View>
                    <View style={styles.globeTextContainer}>
                      <Text style={styles.globeText}>{globe.name}</Text>
                      <Text style={styles.completionText}>{globe.visibility}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
        <View style={styles.postsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#8BB8E8" />
          ) : (
            followingTrips.map((post) => (
              <View 
                key={post.trip.TripID} 
                style={styles.postCard}
              >
                {post.media && post.media.length > 0 && (
                  <View style={styles.imageContainer}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('ExplorePhotoView', {
                        imageUrl: post.media[0].url,
                        tripMedia: post.media,
                        initialIndex: 0,
                        trip: post.trip
                      })}
                    >
                      <Image 
                        source={{ uri: post.media[0].url }}
                        style={styles.postImage}
                      />
                    </TouchableOpacity>
                    <View style={styles.locationHeader}>
                      <Image 
                        source={{ 
                          uri: userProfiles[post.trip.user_id?.toString()] || 'https://via.placeholder.com/40'
                        }}
                        style={styles.profilePic}
                      />
                      <View style={styles.locationContainer}>
                        <Text style={styles.location}>{post.trip.name}</Text>
                      </View>
                    </View>
                    <View style={styles.locationBottom}>
                      <TouchableOpacity 
                        style={styles.likeButton}
                        onPress={() => handleLikeToggle(post.trip.TripID.toString())}
                      >
                        <View style={styles.likeContainer}>
                          <Image 
                            source={
                              likedTrips[post.trip.TripID.toString()]
                              ? require('../assets/filledLike_icon.png')
                              : require('../assets/like_icon.png')
                            } 
                            style={styles.iconItem}
                          />
                          <Text style={styles.likeCount}>
                            {tripLikes[post.trip.TripID.toString()] || 0}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <NavigationBar />
      {}
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
  notificationIcon: {
    fontSize: 24,
  },
  globesScroll: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  createGlobeItem: {
    marginHorizontal: 8,
    width: 150,
    height: 190,
  },
  createGlobePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.41)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(65, 65, 65, 0.02)',
     },
  createGlobeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createGlobeIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(65, 65, 65, 0.15)',
    marginBottom: 15,
  },
  createGlobeIcon: {
    fontSize: 40,
    color: '#fff',
  },
  createGlobeText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
  globePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    padding: 10,
  },
  globeContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  globeIconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeIcon: {
    fontSize: 90,
  },
  globeTextContainer: {
    gap: 4,
  },
  globeText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '600',
  },
  completionText: {
    fontSize: 10,
    color: '#000000',
    opacity: 0.6,
  },
  locationHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 5,
  },
  locationContainer: {
    width: '100%',
    flex: 1,
  },
  locationBottom : {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 5,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 1)',

  },
  location: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  likeIcon: {
    fontSize: 20,
    color: 'black',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profilePic: {
    width: 35,
    height: 35,
    borderRadius: 20,
  },
  likeButton: {
    padding: 4,
  },
  postCard: {
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 450,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },

  postsContainer: {
    paddingBottom: 80,
    gap: 10, 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
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
  imageContainer: {
    position: 'relative',
  },
  likedIcon: {
    color: 'red',
  },
  iconItem: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

export default HomeScreen;

// Add this helper function at the bottom before styles
const getRandomColor = () => {
  const colors = ['#98D8B9', '#FFE5B4', '#B4E4FF', '#FFB4B4', '#B4FFD8'];
  return colors[Math.floor(Math.random() * colors.length)];
};