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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [followingTrips, setFollowingTrips] = useState<TripWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: string}>({});

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

  useEffect(() => {
    fetchFollowingTrips();
  }, []);

  useEffect(() => {
    if (followingTrips.length > 0) {
      followingTrips.forEach(trip => {
        if (trip.trip.user_id) {
          fetchUserProfile(trip.trip.user_id.toString());
        }
      });
    }
  }, [followingTrips]);

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

  
  const globes = [
    { id: 1, name: 'Personal Globe', color: '#98D8B9', completed: 22 },
    { id: 2, name: 'Globe with John Marcus', color: '#FFE5B4', completed: 45 },
    { id: 3, name: 'Globe with your friends', color: '#B4E4FF', completed: 15 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Globes</Text>
        <TouchableOpacity>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.globesScroll}
        >
          
          {globes.map((globe) => (
            <TouchableOpacity 
              key={globe.id} 
              style={styles.globeItem}
            >
              <View style={[styles.globePlaceholder, { backgroundColor: globe.color }]}>
                <View style={styles.globeContent}>
                  <View style={styles.globeIconWrapper}>
                    <Text style={styles.globeIcon}>🌍</Text>
                  </View>
                  <View style={styles.globeTextContainer}>
                    <Text style={styles.globeText}>{globe.name}</Text>
                    <Text style={styles.completionText}>{globe.completed}% completed</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.separator} />

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
                      <TouchableOpacity style={styles.likeButton}>
                        <Text style={styles.likeIcon}>🤍</Text>
                      </TouchableOpacity>                    
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  globeItem: {
    marginHorizontal: 8,
    width: 150,
    height: 190,
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
    padding: 16,
  },
  locationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 5,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 45,
  },
  locationBottom : {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  location: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  likeIcon: {
    fontSize: 24,
    color: '#ffffff',
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
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  postsContainer: {
    padding: 16,
    paddingBottom: 80,
    gap: 20,  // Adds consistent spacing between posts
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
  imageContainer: {
    position: 'relative',
  },
  separator: {
    height: 2,
    backgroundColor: '#eee',
    marginHorizontal: 16,
    marginVertical: 8,
  },
});

export default HomeScreen;
