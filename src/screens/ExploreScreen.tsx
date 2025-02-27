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

const ExploreScreen = () => {
  const navigation = useNavigation();

  const handlePhotoPress = (index: number) => {
    navigation.navigate('PhotoView' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.grid}>
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.tile, { backgroundColor: '#4267B2', flex: 2 }]}
              onPress={() => handlePhotoPress(0)}
            />
            <View style={styles.column}>
              <TouchableOpacity 
                style={[styles.tile, { backgroundColor: '#DD4B39', flex: 1 }]}
                onPress={() => handlePhotoPress(1)}
              />
              <TouchableOpacity 
                style={[styles.tile, { backgroundColor: '#333333', flex: 1 }]}
                onPress={() => handlePhotoPress(2)}
              />
            </View>
          </View>
          
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.tile, { backgroundColor: '#E91E63', flex: 1 }]}
              onPress={() => handlePhotoPress(3)}
            />
            <TouchableOpacity 
              style={[styles.tile, { backgroundColor: '#4CAF50', flex: 2 }]}
              onPress={() => handlePhotoPress(4)}
            />
          </View>
          
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.tile, { backgroundColor: '#9E9E9E', flex: 1 }]}
              onPress={() => handlePhotoPress(5)}
            />
            <TouchableOpacity 
              style={[styles.tile, { backgroundColor: '#1976D2', flex: 1 }]}
              onPress={() => handlePhotoPress(6)}
            />
            <TouchableOpacity 
              style={[styles.tile, { backgroundColor: '#8BC34A', flex: 1 }]}
              onPress={() => handlePhotoPress(7)}
            />
          </View>
          
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.tile, { backgroundColor: '#FFC107', flex: 1 }]}
              onPress={() => handlePhotoPress(8)}
            />
            <TouchableOpacity 
              style={[styles.tile, { backgroundColor: '#9C27B0', flex: 1 }]}
              onPress={() => handlePhotoPress(9)}
            />
          </View>
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
          style={[styles.tabItem, { opacity: 1 }]}
          disabled={true}
        >
          <Text>🔍</Text>
        </TouchableOpacity>
        // In the tab bar section
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile' as never)}
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
  grid: {
    padding: 2,
  },
  row: {
    flexDirection: 'row',
    height: Dimensions.get('window').width / 2,
    marginBottom: 2,
  },
  column: {
    flex: 1,
  },
  tile: {
    margin: 1,
    borderRadius: 4,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
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

export default ExploreScreen;