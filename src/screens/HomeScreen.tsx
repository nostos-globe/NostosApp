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
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mediaService, TripWithMedia } from '../services/mediaService';
import { profileService } from '../services/profileService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { globesService, Globe } from '../services/globesService';
import { likesService } from '../services/likesService';
import NavigationBar from '../components/NavigationBar';
import { authService } from '../services/authService';
import CustomTextRegular from '../components/CustomTextRegular';
import CustomTextBold from '../components/CustomTextBold';

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
  const [refreshing, setRefreshing] = useState(false);
  const [likeProfiles, setLikeProfiles] = useState<{[key: string]: {
      UserID: number,
      ProfilePicture: string,
      username: string
    }[]}>({});
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchMyGlobes(),
      fetchFollowingTrips()
    ]).finally(() => {
      setRefreshing(false);
    });
  }, []);

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
      console.log('Fetched trips:', trips);
      
      const filteredTrips = trips?.filter(trip => trip.trip.user_id !== 1) || [];
      console.log('Filtered trips:', filteredTrips);
      
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
      const currentUser = await authService.getProfile();
      const currentUserId = currentUser?.user.user_id;
      
      // Filter out current user from profiles
      const filteredProfiles = likesData.profiles?.filter(
        (profile: { UserID: number }) => profile.UserID !== currentUserId
      ) || [];
      
      setTripLikes(prev => ({
        ...prev,
        [tripId]: likesData.total_likes || 0
      }));
      
      if (Array.isArray(filteredProfiles)) {
        setLikeProfiles(prev => ({
          ...prev,
          [tripId]: filteredProfiles
        }));
      }
      
      const hasUserLiked = currentUserId && likesData.profiles && 
        likesData.profiles.some((profile: { UserID: number }) => {
          return profile.UserID === currentUserId;
        }) || false;
      
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
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8BB8E8']}
            tintColor="#8BB8E8"
          />
        }
      >
        <View style={styles.header}>
          <CustomTextRegular style={styles.headerTitle}>Your Globes</CustomTextRegular>
        {/* <TouchableOpacity>
          <Image 
            source={require('../assets/notifications_icon.png')}
            style={styles.tabItem}
          />
        </TouchableOpacity> */}
      </View>
      
      
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
                  <CustomTextRegular style={styles.createGlobeIcon}>+</CustomTextRegular>
                </View>
                <CustomTextRegular style={styles.createGlobeText}>Create a new Globe</CustomTextRegular>
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
                        <Image
                            source={require('../assets/globeview.png')}
                            style={styles.globeIcon}
                        />
                    </View>
                    <View style={styles.globeTextContainer}>
                      <CustomTextRegular style={styles.globeText}>{globe.name}</CustomTextRegular>
                      <CustomTextRegular style={styles.completionText}>{globe.visibility}</CustomTextRegular>
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
                      <TouchableOpacity
                        onPress={() => navigation.navigate('OtherProfile', { userId: post.trip.user_id })}
                      >
                        <Image 
                          source={{ 
                            uri: userProfiles[post.trip.user_id?.toString()] || 'https://via.placeholder.com/40'
                          }}
                          style={styles.profilePic}
                        />
                      </TouchableOpacity>
                      <View style={styles.locationContainer}>
                        <CustomTextRegular style={styles.location}>{post.trip.name}</CustomTextRegular>
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
                          <CustomTextRegular style={styles.likeCount}>
                            {tripLikes[post.trip.TripID.toString()] || 0}
                          </CustomTextRegular>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Display users who liked the post */}
                      {likeProfiles[post.trip.TripID.toString()] && 
                       likeProfiles[post.trip.TripID.toString()].length > 0 && (
                        <View style={styles.likeProfilesContainer}>
                          <View style={styles.profilesAndTextContainer}>
                            <ScrollView 
                              horizontal 
                              showsHorizontalScrollIndicator={false}
                              style={styles.profilesScrollView}
                            >
                              {likeProfiles[post.trip.TripID.toString()].slice(0, 2).map((profile) => (
                                <View 
                                  key={`${post.trip.TripID}-${profile.UserID}-container`}
                                  style={{ marginRight: 5 }}
                                >
                                  <Image 
                                    source={{ uri: profile.ProfilePicture || 'https://via.placeholder.com/30' }}
                                    style={styles.likeProfilePic}
                                  />
                                </View>
                              ))}
                              {likeProfiles[post.trip.TripID.toString()].length > 5 && (
                                <View 
                                  key={`${post.trip.TripID}-more-indicator`}
                                  style={styles.moreProfilesIndicator}
                                >
                                  <CustomTextRegular style={styles.moreProfilesText}>
                                    +{likeProfiles[post.trip.TripID.toString()].length - 5}
                                  </CustomTextRegular>
                                </View>
                              )}
                            </ScrollView>
                            <TouchableOpacity
                              onPress={() => navigation.navigate('FollowList', {
                                type: 'likes',
                                userId: post.trip.user_id,
                                profiles: likeProfiles[post.trip.TripID.toString()].map(profile => ({
                                  UserID: profile.UserID,
                                  Username: profile.username,
                                  ProfilePicture: profile.ProfilePicture
                                }))
                              })}
                            >
                              <CustomTextRegular style={styles.likedByText}>
                                {likeProfiles[post.trip.TripID.toString()].length > 1 ? (
                                  <>
                                    <CustomTextBold style={styles.clickableText}>
                                      {likeProfiles[post.trip.TripID.toString()][0].username}
                                    </CustomTextBold>
                                    {` and ${likeProfiles[post.trip.TripID.toString()].length} others liked this post`}
                                  </>
                                ) : (
                                  <>
                                    <CustomTextBold style={styles.clickableText}>
                                      {likeProfiles[post.trip.TripID.toString()][0].username}
                                    </CustomTextBold>
                                    {` liked this post`}
                                  </>
                                )}
                              </CustomTextRegular>

                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
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
    width: 100,
    height: 100,
  },
  globeTextContainer: {
    gap: 4,
  },
  globeText: {
    fontSize: 12,
    lineHeight: 12,
    color: '#000000',
  },
  completionText: {
    fontSize: 9,
    color: '#000000',
    opacity: 1,
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
    marginTop: 30,
    marginBottom: -10,
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
  },
  likeProfilesContainer: {
    marginTop: 5,
  },
  profilesAndTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilesScrollView: {
    flexGrow: 0,
  },
  likeProfilePic: {
    width: 20,
    height: 20,
    borderRadius: 15,
    
  },
  likedByText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 10,
  },
  moreProfilesIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreProfilesText: {
    fontSize: 10,
    color: '#333',
  },
  clickableText: {

  },

});

export default HomeScreen;

// Add this helper function at the bottom before styles
const getRandomColor = () => {
  const colors = ['#98D8B9', '#FFE5B4', '#B4E4FF', '#FFB4B4', '#B4FFD8'];
  return colors[Math.floor(Math.random() * colors.length)];
};
