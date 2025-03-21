import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native';


const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Globes</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.globesContainer}>
          <View style={styles.globeItem}>
            <View style={styles.globePlaceholder} />
            <Text style={styles.globeText}>Organized Globe</Text>
          </View>
        </View>

        <View style={styles.postsContainer}>
          <View style={styles.postCard}>
            <Text style={styles.location}>Japan</Text>
            <View style={styles.postImagePlaceholder} />
            <View style={styles.postActions}>
              <TouchableOpacity>
                <Text>❤️</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text>💬</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  globesContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  globeItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  globeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  globeText: {
    marginTop: 4,
    fontSize: 12,
  },
  postsContainer: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  location: {
    padding: 12,
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  postActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 16,
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
  globePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
  },
  postImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
});

export default HomeScreen;