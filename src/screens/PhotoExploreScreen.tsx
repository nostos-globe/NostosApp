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
import NavigationBar from '../components/NavigationBar';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PhotoExploreScreen = () => {  // Changed component name to match file name
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { tripMedia, initialIndex = 0, trip } = route.params as { 
    tripMedia: TripMedia[],
    initialIndex: number,
    trip: Trip
  };
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mediaVisibility, setMediaVisibility] = useState<Record<string, string>>({});
  const scrollViewRef = React.useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: initialIndex * Dimensions.get('window').width,
        animated: false
      });
    }
  }, [initialIndex]);

  const handleVisibilityChange = async () => {
    if (!tripMedia || tripMedia.length === 0 || currentIndex >= tripMedia.length) {
      return;
    }
    const mediaId = tripMedia[currentIndex].mediaId.toString();    
  }; // Added missing closing brace

  const handleScroll = (event: any) => {  // Moved outside handleVisibilityChange
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / Dimensions.get('window').width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{trip?.name || "Personal Globe"}</Text>
      </View>
      
      <View style={styles.iconBar}>
        <TouchableOpacity>
          <Text style={styles.iconText}>⭐</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.iconText}>⏱️</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.iconText}>📍</Text>
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

export default PhotoExploreScreen;  // Changed export name to match component