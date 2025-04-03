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

const HomeScreen = () => {
  const navigation = useNavigation();
  const [followingTrips, setFollowingTrips] = useState<TripWithMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('HomeScreen mounted');
    fetchFollowingTrips();
    return () => {
      console.log('HomeScreen unmounted');
    };
  }, []);

  const fetchFollowingTrips = async () => {
    try {
      setLoading(true);
      console.log('Fetching following trips...');
      const trips = await mediaService.getFollowingTrips();
      
      console.log('Raw trips data:', JSON.stringify(trips, null, 2));
      console.log('Number of trips received:', trips?.length || 0);
      
      if (trips && trips.length > 0) {
        console.log('First trip details:', {
          tripId: trips[0].trip.TripID,
          userId: trips[0].trip.user_id,
          name: trips[0].trip.name,
          mediaCount: trips[0].media?.length || 0,
          firstMediaUrl: trips[0].media?.[0]?.url || 'No media'
        });
      }
      
      const filteredTrips = trips?.filter(trip => trip.trip.user_id !== 1) || [];
      console.log('Filtered trips count:', filteredTrips.length);
      
      setFollowingTrips(filteredTrips);
    } catch (error) {
      console.error('Error fetching following trips:', error);
      setFollowingTrips([]);
    } finally {
      setLoading(false);
      console.log('Fetch operation completed');
    }
  };

  // Add this logging when rendering trips
  <View style={styles.postsContainer}>
    {loading ? (
      <ActivityIndicator size="large" color="#8BB8E8" />
    ) : (
      followingTrips.map((post) => {
        console.log('Rendering trip:', post.trip.TripID, post.trip.name);
        return (
          <View 
            key={post.trip.TripID} 
            style={styles.postCard}
          >
            <View style={styles.locationHeader}>
              <Text style={styles.location}>{post.trip.name}</Text>
              <Text style={styles.location}>{post.location}</Text>
              <TouchableOpacity style={styles.likeButton}>
                <Text style={styles.likeIcon}>🤍</Text>
              </TouchableOpacity>
            </View>
            {post.media && post.media.length > 0 && (
              <Image 
                source={{ uri: post.media[0].url }}
                style={styles.postImage}
              />
            )}
          </View>
        );
      })
    )}
  </View>
  const globes = [
    { id: 1, name: 'Personal Globe', color: '#98D8B9' },
    { id: 2, name: 'Globe with John Marcus', color: '#FFE5B4' },
    { id: 3, name: 'Globe with your friends', color: '#B4E4FF' },
  ];

  const feedPosts = [
    {
      id: 1,
      location: 'Japan',
      image: 'https://example.com/japan.jpg',
      flag: '🇯🇵',
      likes: 234,
    },
    {
      id: 2,
      location: 'China',
      image: 'https://example.com/china.jpg',
      flag: '🇨🇳',
      likes: 187,
    },
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
                <Text style={styles.globeIcon}>🌍</Text>
              </View>
              <Text style={styles.globeText}>{globe.name}</Text>
            </TouchableOpacity>
          ))}
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
                <View style={styles.locationHeader}>
                  <Text style={styles.location}>{post.trip.name}</Text>
                  <Text style={styles.location}>{post.location}</Text>
                  <TouchableOpacity style={styles.likeButton}>
                    <Text style={styles.likeIcon}>🤍</Text>
                  </TouchableOpacity>
                </View>
                {post.media && post.media.length > 0 && (
                  <Image 
                    source={{ uri: post.media[0].url }}
                    style={styles.postImage}
                  />
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
          disabled={true}
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
    alignItems: 'center',
    marginHorizontal: 8,
    width: 100,
  },
  globePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  globeIcon: {
    fontSize: 32,
  },
  globeText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
  },
  likeButton: {
    padding: 4,
  },
  likeIcon: {
    fontSize: 20,
  },
  postCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  postsContainer: {
    padding: 16,
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
});

export default HomeScreen;