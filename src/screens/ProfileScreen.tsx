import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions, Alert,
  Image, ImageBackground, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import { profileService, Profile, FollowerFollowing, FollowResponse } from '../services/profileService';
import { mediaService, TripMedia, TripWithMedia } from '../services/mediaService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import NavigationBar from '../components/NavigationBar';
import ProfileCategories from '../components/ProfileCategories';
import { globesService, Globe, GlobeWithTrips } from '../services/globesService'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followers, setFollowers] = useState<FollowResponse>({ 
    Follow: { count: 0, profiles: [] } 
  });
  const [following, setFollowing] = useState<FollowResponse>({ 
    Follow: { count: 0, profiles: [] } 
  });
  const [trips, setTrips] = useState<TripWithMedia[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('trips');
  const [globes, setGlobes] = useState<Globe[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedBio, setEditedBio] = useState('');

  useEffect(() => {
    loadProfileData();

    // Add focus listener
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfileData();
    });

    // Cleanup subscription
    return unsubscribe;
  }, [navigation]);

  const handleCategoryPress = (category: string) => {
    // Handle category selection here
    console.log('Selected category:', category);
  };

  const getRandomColor = () => {
    const colors = [
      '#98D8B9', '#FFE5B4', '#B4E4FF', '#FFB4B4', '#B4FFD8',
      '#FFD1DC', '#E6E6FA', '#F0E68C', '#98FB98', '#DDA0DD',
      '#F0FFF0', '#E0FFFF', '#FFE4E1', '#F5F5DC', '#E6E6FA'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

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

  // Add this with other state declarations
  const [likedTrips, setLikedTrips] = useState<TripWithMedia[]>([]);

  const loadProfileData = async () => {
    console.log('ProfileScreen: Loading profile data...');
    try {
      const currentUser = await authService.getProfile();
      console.log('ProfileScreen: Current user data:', currentUser);

      const userId = currentUser?.user?.user_id;
      if (!userId) {
        console.error('ProfileScreen: No user ID found');
        throw new Error('No user ID found');
      }

      const tripsData = await mediaService.getMyTrips();
      console.log('ProfileScreen: Trips data loaded:', tripsData?.length || 0, 'trips');
      setTrips(tripsData || []); // Set empty array if tripsData is null

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

      const userGlobes = await globesService.getMyGlobes();
      console.log('ProfileScreen: Globes loaded:', userGlobes?.length || 0, 'globes');
      setGlobes(userGlobes || []);
      
      const likedTripsData = await mediaService.getLikedTrips();
      console.log('ProfileScreen: Liked trips loaded:', likedTripsData?.length || 0, 'trips');
      setLikedTrips(likedTripsData || []);

    } catch (error) {
      console.error('ProfileScreen: Error loading profile:', error);
      Alert.alert(
        'Error',
        'Failed to load profile data. Please check your connection and try again.'
      );
    }
  };

  const handleSaveProfile = async () => {
    try {
      await profileService.updateProfile({
        Username: editedUsername,
        Bio: editedBio
      });
      await loadProfileData(); // Refresh profile data
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
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
    <ImageBackground 
      source={{ uri: profile?.ProfilePicture || 'https://placeholder.com/1200x400' }}
      style={styles.coverImage}
    >
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text>⚙️</Text>
      </TouchableOpacity>
    </ImageBackground>
    
    <View style={styles.profileContainer}>
      <Image 
        source={{ uri: profile?.ProfilePicture || undefined }}
        style={styles.avatarPlaceholder}
      />
      {isEditing ? (
        <>
          <TextInput
            style={styles.editInput}
            value={editedUsername}
            onChangeText={setEditedUsername}
            placeholder={profile?.Username || "Username"}
          />
          <TextInput
            style={[styles.editInput, styles.bioInput]}
            value={editedBio}
            onChangeText={setEditedBio}
            placeholder={profile?.Bio || "Bio"}
            multiline
          />
        </>
      ) : (
        <>
          <Text style={styles.username}>{profile?.Username || 'Loading...'}</Text>
          <Text style={styles.bio}>{profile?.Bio || 'No bio available'}</Text>
        </>
      )}
      
      // In the stats section, replace the existing stats View with this:
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{trips?.length || 0}</Text>
          <Text style={styles.statLabel}>Viajes Completados</Text>
        </View>
        {followers.Follow.count > 0 ? (
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => {
              if (profile?.UserID) {
                navigation.navigate('FollowList', { 
                  type: 'followers',
                  userId: profile.UserID,
                  profiles: followers.Follow.profiles
                });
              }
            }}
          >
            <Text style={styles.statNumber}>{followers.Follow.count}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        )}
        {following.Follow.count > 0 ? (
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => {
              if (profile?.UserID) {
                navigation.navigate('FollowList', { 
                  type: 'following',
                  userId: profile.UserID,
                  profiles: following.Follow.profiles
                });
              }
            }}
          >
            <Text style={styles.statNumber}>{following.Follow.count}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        {isEditing ? (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setIsEditing(false);
              setEditedUsername(profile?.Username || '');
              setEditedBio(profile?.Bio || '');
            }}
          >
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Compartir</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
        >
          <Text style={styles.actionButtonText}>
            {isEditing ? 'Guardar' : 'Editar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ProfileCategories 
  onCategoryPress={(category) => setSelectedCategory(category)}
  selectedCategory={selectedCategory}
/>
    </View>

{/* Content based on selected category */}
{selectedCategory === 'trips' && (
      <View style={styles.gridContainer}>
        {trips?.map((trip) => (
          <TouchableOpacity 
            key={trip.trip.TripID} 
            style={styles.gridItem}
            onPress={() => {
              navigation.navigate('PhotoView', {
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
    )}

    {selectedCategory === 'favorites' && (
      <View style={styles.gridContainer}>
        {likedTrips.length > 0 ? (
          likedTrips.map((trip) => (
            <TouchableOpacity 
              key={trip.trip.TripID} 
              style={styles.gridItem}
              onPress={() => {
                navigation.navigate('PhotoView', {
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
          ))
        ) : (
          <Text style={styles.emptyStateText}>No liked trips yet</Text>
        )}
      </View>
    )}

    {selectedCategory === 'globes' && (
      <View style={styles.globesGrid}>
      {globes.length > 0 ? (
        globes.map((globe) => (
          <TouchableOpacity 
            key={globe.AlbumID}
            style={styles.globeCard}
            onPress={() => navigation.navigate('Globe3DView', { globe })}
          >
            <View style={[styles.globePlaceholder, { backgroundColor: getRandomColor() }]}>
              <View style={styles.globeContent}>
                <Text style={styles.globeEmoji}>🌍</Text>
                <View style={styles.globeInfo}>
                  <Text style={styles.globeName}>{globe.name}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
          <View style={styles.emptyStateText}>
            <Text style={styles.emptyStateText}>No globes created yet</Text>
          </View>
        )}
      </View>
    )}
      </ScrollView>
      
      <NavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 70,
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
    paddingHorizontal: 50,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#000',
    fontWeight: '500',
  },
  categoryButton: {
    padding: 8,
    alignItems: 'center',
  },
  activeCategoryButton: {
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 45,
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1.5,
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
    width: 30,
    height: 30,
    justifyContent: 'center',
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
    position: 'absolute', 
    bottom: 0, 
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
  emptyStateText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
    width: '100%',
  },
  globesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 0,
    paddingRight: 5,
    paddingBottom: 100,
  },
  globeCard: {
    width: '33%',
    aspectRatio: 0.8,
    marginBottom: 16,
  },
  globePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    padding: 16,
  },
  globeContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  globeEmoji: {
    fontSize: 50,
    textAlign: 'center',
    marginTop: 20,
  },
  globeInfo: {
    marginTop: 'auto',
  },
  globeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  editInput: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default ProfileScreen;
