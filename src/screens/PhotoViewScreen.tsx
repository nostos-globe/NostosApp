import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

const PhotoViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const selectedIndex = (route.params as { selectedIndex?: number })?.selectedIndex || 0;
  const scrollViewRef = React.useRef<ScrollView>(null);
  React.useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: selectedIndex * Dimensions.get('window').width,
        animated: false
      });
    }
  }, [selectedIndex]);
  const photos = [
    { id: 1, title: 'Mountain View' },
    { id: 2, title: 'Lake View' },
    { id: 3, title: 'Forest Path' },
    { id: 4, title: 'City Landscape' },
  ];
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {photos.map((photo, index) => (
          <View key={photo.id} style={styles.photoContainer}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.placeholderText}>{photo.title}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.fixedTabBar}>
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
        <TouchableOpacity style={styles.tabItem}>
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
  scrollView: {
    flex: 1,
  },
  photoContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 83, // Adjust for tab bar height
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
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

export default PhotoViewScreen;