import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { globesService, Globe } from '../services/globesService';
import NavigationBar from '../components/NavigationBar';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GlobesList = () => {
  const navigation = useNavigation<NavigationProp>();
  const [globes, setGlobes] = useState<Globe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobes = async () => {
    try {
      setLoading(true);
      const userGlobes = await globesService.getMyGlobes();
      setGlobes(userGlobes);
    } catch (error) {
      console.error('Error fetching globes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobes();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Globes</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8BB8E8" style={styles.loader} />
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.globesGrid}>
            {globes.map((globe) => (
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
                      <Text style={styles.globeVisibility}>{globe.visibility}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    width: 40,
    height: 40,
    backgroundColor: '#8BB8E8',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 100, // Add padding to account for the tab bar
  },
  globeCard: {
    width: '47%',
    aspectRatio: 0.8,
    marginBottom: 16,
  },
  globePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  globeVisibility: {
    fontSize: 14,
    color: '#000',
    opacity: 0.6,
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

const getRandomColor = () => {
  const colors = ['#98D8B9', '#FFE5B4', '#B4E4FF', '#FFB4B4', '#B4FFD8'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default GlobesList;