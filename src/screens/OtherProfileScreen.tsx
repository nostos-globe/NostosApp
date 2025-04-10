import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions, Alert,
  Image, ImageBackground, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import { profileService, Profile, FollowerFollowing, FollowResponse } from '../services/profileService';
import { mediaService, TripMedia, TripWithMedia } from '../services/mediaService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useRoute } from '@react-navigation/native';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OtherProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followers, setFollowers] = useState<FollowResponse>({ 
    Follow: { count: 0, profiles: [] } 
  });
  const [following, setFollowing] = useState<FollowResponse>({ 
    Follow: { count: 0, profiles: [] } 
  });
  const [trips, setTrips] = useState<TripWithMedia[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { userId } = route.params as { userId: string };

  useEffect(() => {
    loadProfileData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProfileData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadProfileData = async () => {
    console.log('ProfileScreen: Loading profile data...');
    try {
      const tripsData = await mediaService.getTripsByUserId(userId);
      console.log('ProfileScreen: Trips data loaded:', tripsData?.length || 0, 'trips');
      setTrips(tripsData || []);

      const profileData = await profileService.getProfileById(userId);
      console.log('ProfileScreen: Profile data loaded:', profileData);
      setProfile(profileData);
      
      const [followersData, followingData] = await Promise.all([
          profileService.getFollowers(profileData.UserID.toString()),
          profileService.getFollowing(profileData.UserID.toString())
      ]);
      
      console.log('ProfileScreen: Followers/Following data loaded:', {
        followers: followersData.Follow.count,
        following: followingData.Follow.count
      });
      
      setFollowers(followersData);
      setFollowing(followingData);
      
    } catch (error) {
      console.error('ProfileScreen: Error loading profile:', error);
      Alert.alert(
        'Error',
        'Failed to load profile data. Please check your connection and try again.'
      );
    }
  };


  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8BB8E8']}
            tintColor={'#8BB8E8'}
          />
        }
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <ImageBackground 
          source={{ uri: profile?.ProfilePicture || 'https://placeholder.com/1200x400' }}
          style={styles.coverImage}
        >
        </ImageBackground>
    <View style={styles.profileContainer}>
      <Image 
        source={{ uri: profile?.ProfilePicture || undefined }}
        style={styles.avatarPlaceholder}
      />
      <Text style={styles.username}>{profile?.Username || 'Loading...'}</Text>
      <Text style={styles.bio}>{profile?.Bio || 'No bio available'}</Text>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{trips?.length || 0}</Text>
          <Text style={styles.statLabel}>Viajes Completados</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{followers.Follow.count}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{following.Follow.count}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Compartir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tripCategories}>
        <TouchableOpacity style={styles.categoryButton}>
          <Text>🧳</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Text>🎬</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Text>❤️</Text>
        </TouchableOpacity>
      </View>
    </View>

      // In the return statement, update the ScrollView and TabBar sections:
      <View style={styles.gridContainer}>
  {trips?.map((trip) => (
    <TouchableOpacity 
      key={trip.trip.TripID} 
      style={styles.gridItem}
      onPress={() => {
        navigation.navigate('ExplorePhotoView', {
          imageUrl: trip.media?.[0]?.url,
          tripMedia: trip.media || [],
          initialIndex: 0,
          trip: trip.trip
        });
      }}
    >
      <View style={styles.gridItemContent}>
        <Image 
          source={{ uri: trip.media?.[0]?.url || 'https://via.placeholder.com/150' }}
          style={styles.photoPlaceholder}
          resizeMode="cover"
        />
        <View style={styles.tripOverlay}>
          <Text style={styles.tripName} numberOfLines={1}>{trip.trip.name}</Text>
          <Text style={styles.mediaCount}>{trip.media?.length || 0} photos</Text>
        </View>

      </View>
    </TouchableOpacity>
  ))}
</View>
      </ScrollView>
      
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0, 
  },
  gridItemContent: {
    flex: 1,
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  coverImage: {
    height: 150,
    justifyContent: 'flex-end',
    padding: 16,
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  profileContainer: {
    marginTop: -60,
    padding: 10,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 0,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bio: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#000',
    fontWeight: '500',
  },
  tripCategories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryButton: {
    padding: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  gridItem: {
    width: Dimensions.get('window').width / 3,
    height: (Dimensions.get('window').width / 3) * 1.6, 
    padding: 1,
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
  logoutButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  tripOverlay: {
    position: 'absolute', // Changed from relative to absolute
    bottom: 0, // Changed from 33 to 0
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.69)',
    padding: 4,
    zIndex: 1,
  },
  tripName: {
    color: '#000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mediaCount: {
    color: '#000',
    fontSize: 9,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
});

export default OtherProfileScreen;
