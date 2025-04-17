import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const NavigationBar = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();

  const getHomeIcon = () => {
    return route.name === 'Home' 
      ? require('../assets/selectedHomeIcon.png')
      : require('../assets/home_icon.png');
  };

  const getGlobeIcon = () => {
    return route.name === 'GlobesList'
      ? require('../assets/selectedGlobeIcon.png')
      : require('../assets/globeIcon.png');
  };

  const getExploreIcon = () => {
    return route.name === 'Explore'
      ? require('../assets/selectedFindIcon.png')
      : require('../assets/findIcon.png');
  };

  const getProfileIcon = () => {
    return route.name === 'Profile'
      ? require('../assets/selectedProfileIcon.png')
      : require('../assets/profileIcon.png');
  };

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity 
        style={styles.tabItem}
        onPress={() => navigation.navigate('Home')}
      >
        <Image 
          source={getHomeIcon()}
          style={styles.tabItem}
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.tabItem}
        onPress={() => navigation.navigate('GlobesList')}
      >
        <Image 
          source={getGlobeIcon()}
          style={styles.tabItem}
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddContent')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.tabItem}
        onPress={() => navigation.navigate('Explore')}
      >
        <Image 
          source={getExploreIcon()}
          style={styles.tabItem}
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.tabItem}
        onPress={() => navigation.navigate('Profile')}
      >
        <Image 
          source={getProfileIcon()}
          style={styles.tabItem}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  });
  
  export default NavigationBar;