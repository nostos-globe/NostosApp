import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import NavigationBar from '../components/NavigationBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddContentScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Content</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.option}
          onPress={() => navigation.navigate('CreateMedia')}
        >
          <View style={styles.optionIcon}>
            <Image 
              source={require('../assets/media_icon.png')}
              style={styles.icon}
            />
          </View>
          <Text style={styles.optionTitle}>Add Media</Text>
          <Text style={styles.optionDescription}>Upload photos or videos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => navigation.navigate('AddTrip')}
        >
          <View style={styles.optionIcon}>
            <Image 
              source={require('../assets/trip_icon.png')}
              style={styles.icon}
            />
          </View>
          <Text style={styles.optionTitle}>Create Trip</Text>
          <Text style={styles.optionDescription}>Start a new journey</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => navigation.navigate('CreateGlobe')}
        >
          <View style={styles.optionIcon}>
            <Image 
              source={require('../assets/globe_icon.png')}
              style={styles.icon}
            />
          </View>
          <Text style={styles.optionTitle}>Create Globe</Text>
          <Text style={styles.optionDescription}>Create a new collection</Text>
        </TouchableOpacity>
      </View>
      <NavigationBar />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  option: {
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8BB8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default AddContentScreen;