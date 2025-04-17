import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Trip, TripMedia, uploadMediaToTrip, mediaService } from '../services/mediaService';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { likesService } from '../services/likesService';
import NavigationBar from '../components/NavigationBar';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PhotoViewScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  // In the route params section
  const { tripMedia, initialIndex = 0, trip } = route.params as { 
    tripMedia: TripMedia[],
    initialIndex: number,
    trip: Trip
  };
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mediaVisibility, setMediaVisibility] = useState<Record<string, string>>({});
  const scrollViewRef = React.useRef<ScrollView>(null);
  // Add a new state to track favorited media
  const [favoritedMedia, setFavoritedMedia] = useState<Record<string, boolean>>({});
  
  // Add a function to fetch favorite status for all media
  // Add more detailed logging to fetchMediaFavorites
  // Update the fetchMediaFavorites function to correctly parse the API response
  const fetchMediaFavorites = async () => {
    console.log('Starting to fetch favorites for all media items');
    const favoritesMap: Record<string, boolean> = {};
    
    for (const media of tripMedia) {
      try {
        const mediaId = media.mediaId.toString();
        console.log(`Fetching favorite status for media ID: ${mediaId}`);
        const response = await likesService.getMediaFavoriteStatus(mediaId);
        console.log('API Response for favorite status:', JSON.stringify(response));
        
        // Check if the response indicates this media is favorited
        // The API returns is_favorite instead of isFavorited
        const isFavorited = response.is_favourite || false;
        console.log(`Media ${mediaId} favorite status: ${isFavorited}`);
        favoritesMap[mediaId] = isFavorited;
      } catch (error) {
        console.error('Error fetching favorite status for media', media.mediaId, error);
        favoritesMap[media.mediaId.toString()] = false;
      }
    }
    
    console.log('Final favorites map:', favoritesMap);
    setFavoritedMedia(favoritesMap);
  };
  
  // Update the useEffect to also fetch favorites
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: initialIndex * Dimensions.get('window').width,
        animated: false
      });
    }
    
    // Fetch visibility and favorites for all media items
    fetchMediaVisibility();
    fetchMediaFavorites();
  }, [initialIndex]);

  const fetchMediaVisibility = async () => {
    const visibilityMap: Record<string, string> = {};
    
    for (const media of tripMedia) {
      try {
        const mediaId = media.mediaId.toString();
        const visibility = await mediaService.getMediaVisibility(mediaId);
        visibilityMap[mediaId] = visibility;
      } catch (error) {
        console.error('Error fetching visibility for media', media.mediaId, error);
        visibilityMap[media.mediaId.toString()] = '';
      }
    }
    
    setMediaVisibility(visibilityMap);
  };

  const getVisibilityIcon = (mediaId: string): string => {
    const visibility = mediaVisibility[mediaId];
    if (visibility === 'PRIVATE') {
      return '🔒'; // Lock icon for private
    } else if (visibility === 'FRIENDS') {
      return '👥'; // People icon for friends-only
    } else if (visibility === 'PUBLIC') {
      return '🌐'; // Globe for public visibility
    }
    return '🔒'; // Default to lock if not loaded yet
  };

  const handleVisibilityChange = async () => {
    if (!tripMedia || tripMedia.length === 0 || currentIndex >= tripMedia.length) {
      return;
    }

    const mediaId = tripMedia[currentIndex].mediaId.toString();
    const currentVisibility = mediaVisibility[mediaId] || 'PRIVATE';
    
    // Cycle through visibility options
    let newVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
    
    if (currentVisibility === 'PRIVATE') {
      newVisibility = 'FRIENDS';
    } else if (currentVisibility === 'FRIENDS') {
      newVisibility = 'PUBLIC';
    } else {
      newVisibility = 'PRIVATE';
    }
    
    try {
      await mediaService.changeMediaVisibility(mediaId, newVisibility);
      
      // Update local state
      setMediaVisibility(prev => ({
        ...prev,
        [mediaId]: newVisibility
      }));
    } catch (error) {
      console.error('Error changing visibility:', error);
      Alert.alert('Error', 'Failed to change visibility');
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / Dimensions.get('window').width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // Add more logging to handleFavoriteToggle
  const handleFavoriteToggle = async () => {
    if (!tripMedia || tripMedia.length === 0 || currentIndex >= tripMedia.length) {
      console.log('Cannot toggle favorite: invalid media or index');
      return;
    }
  
    const mediaId = tripMedia[currentIndex].mediaId.toString();
    const isFavorited = favoritedMedia[mediaId] || false;
    console.log(`Toggling favorite for media ${mediaId}. Current status: ${isFavorited}`);
    
    try {
      if (isFavorited) {
        console.log(`Attempting to unfavorite media ${mediaId}`);
        const response = await likesService.unfavMedia(mediaId);
        console.log('Unfavorite response:', response);
      } else {
        console.log(`Attempting to favorite media ${mediaId}`);
        const response = await likesService.favMedia(mediaId);
        console.log('Favorite response:', response);
      }
      
      // Update local state
      const newStatus = !isFavorited;
      console.log(`Updating favorite status for media ${mediaId} to: ${newStatus}`);
      setFavoritedMedia(prev => ({
        ...prev,
        [mediaId]: newStatus
      }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleImageUpload = async () => {
    try {
      // Use react-native-image-picker instead of expo-image-picker
      launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        includeBase64: false,
      }, async (response) => {
        if (response.didCancel) {
          return;
        }
        
        if (response.errorCode) {
          console.error('ImagePicker Error: ', response.errorMessage);
          return;
        }
        
        if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          
          // Call the upload endpoint with the selected image and trip
          await uploadMediaToTrip(trip.TripID.toString(), selectedImage.uri || '');
          
          // Refresh the screen or navigate back to reload the images
          navigation.goBack();
          navigation.navigate('PhotoView', { 
            imageUrl: tripMedia[0]?.url,
            tripMedia, 
            initialIndex, 
            trip 
          });
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDeleteMedia = async () => {
    if (!tripMedia || tripMedia.length === 0 || currentIndex >= tripMedia.length) {
      return;
    }
  
    const mediaId = tripMedia[currentIndex].mediaId.toString();
    
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await mediaService.deleteMedia(mediaId);
              
              // Create a new array without the deleted media
              const updatedMedia = [...tripMedia];
              updatedMedia.splice(currentIndex, 1);
              
              if (updatedMedia.length === 0) {
                // If no media left, go back to profile
                navigation.goBack();
                return;
              }
              
              // Adjust current index if needed
              const newIndex = currentIndex >= updatedMedia.length 
                ? updatedMedia.length - 1 
                : currentIndex;
              
              // Update the screen with the new media array
              navigation.setParams({
                tripMedia: updatedMedia,
                initialIndex: newIndex,
                trip
              });
              
              // Update local state
              setCurrentIndex(newIndex);
              
              // Show success message
              Alert.alert("Success", "Photo deleted successfully");
            } catch (error) {
              console.error('Error deleting media:', error);
              Alert.alert("Error", "Failed to delete photo. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{trip?.name || "Personal Globe"}</Text>

        <TouchableOpacity onPress={handleImageUpload}>
          <Text style={styles.addButton2}>+</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.iconBar}>
        <TouchableOpacity onPress={handleVisibilityChange}>
          <Text style={styles.iconText}>
            {tripMedia && tripMedia.length > 0 && currentIndex < tripMedia.length
              ? getVisibilityIcon(tripMedia[currentIndex].mediaId.toString())
              : '🔒'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFavoriteToggle}>
          <Image 
              source={
                tripMedia && 
                tripMedia.length > 0 && 
                currentIndex < tripMedia.length &&
                favoritedMedia[tripMedia[currentIndex].mediaId.toString()]
                  ? require('../assets/filledFav_icon.png')
                  : require('../assets/fav_icon.png')
              }
              style={styles.iconItem}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image 
                source={require('../assets/info_icon.png')}
                style={styles.iconItem}
          />
        </TouchableOpacity>
        {/* Then update the trash icon TouchableOpacity: */}
        <TouchableOpacity onPress={handleDeleteMedia}>
          <Image 
                source={require('../assets/delete_icon.png')}
                style={styles.iconItem}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {trip?.start_date ? new Date(trip.start_date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : "10 March 2024"}
        </Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {tripMedia.map((media, index) => (
          <View key={media.mediaId} style={styles.photoContainer}>
            <Image
              source={{ uri: media.url }}
              style={styles.photo}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.thumbnailContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tripMedia.map((media, index) => (
            <TouchableOpacity 
              key={`thumb-${media.mediaId}`}
              style={[
                styles.thumbnail,
                currentIndex === index ? styles.activeThumbnail : null
              ]}
              onPress={() => {
                setCurrentIndex(index);
                scrollViewRef.current?.scrollTo({
                  x: index * Dimensions.get('window').width,
                  animated: true
                });
              }}
            >
              <Image
                source={{ uri: media.url }}
                style={styles.thumbnailImage}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <NavigationBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000',
  },
  photoContainer: {
    width: Dimensions.get('window').width,
    marginTop: 140,
    height: "66%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton2: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
    width: 34,
    height: 34,
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 22,
    elevation: 25,
    textAlign: 'center',
  },
  addButton: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
    width: 50,
    height: 50,
    backgroundColor: '#8BB8E8',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    paddingVertical: 12,
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderTopWidth: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconText: {
    color: '#000',
    fontSize: 20,
  },
  iconItem: {
    width: 20,
    height: 20,
  },
  dateContainer: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
  },
  dateText: {
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.69)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9,
    fontSize: 14,
    fontWeight: '500',
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgb(255, 255, 255)',
  },
  thumbnail: {
    width: 60,
    height: 80,
    overflow: 'hidden',
    borderWidth: 0.2,
    borderColor: '#fff',
  },
  activeThumbnail: {
    borderWidth: 2,
    borderColor: '#8BB8E8',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  fixedTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabItem: {
    width: 30,
    height: 30,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
});

export default PhotoViewScreen;