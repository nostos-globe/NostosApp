import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import { profileService, Profile } from '../services/profileService';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const currentUser = await authService.getProfile();
      if (!currentUser?.user?.id) {
        throw new Error('No user ID found');
      }

      const profileData = await profileService.getProfileById(currentUser.user.id);
      setProfile(profileData);

      const [followersData, followingData] = await Promise.all([
        profileService.getFollowers(profileData.id),
        profileService.getFollowing(profileData.id)
      ]);

      setFollowers(followersData);
      setFollowing(followingData);
    } catch (error) {
      console.error('Error loading profile:', error);
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <View style={styles.avatarPlaceholder} />
          <Text style={styles.username}>Alex Doe</Text>
          <Text style={styles.bio}>Travel enthusiast | Photographer</Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>856</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>162</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      // In the return statement, update the ScrollView and TabBar sections:
      
            <ScrollView style={styles.content}>
              <View style={styles.gridContainer}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <TouchableOpacity 
                    key={item} 
                    style={styles.gridItem}
                    onPress={() => navigation.navigate('PhotoView' as never)}
                  >
                    <View style={styles.photoPlaceholder} />
                  </TouchableOpacity>
                ))}
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
                disabled={true}
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
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bio: {
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 1,
  },
  gridItem: {
    width: Dimensions.get('window').width / 3 - 2,
    height: Dimensions.get('window').width / 3 - 2,
    margin: 1,
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: '#E0E0E0',
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
});

export default ProfileScreen;