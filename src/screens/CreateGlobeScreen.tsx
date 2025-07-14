import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { globesService } from '../services/globesService';
import NavigationBar from '../components/NavigationBar';
import CustomTextRegular from '../components/CustomTextRegular';
import CustomTextBold from '../components/CustomTextBold';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreateGlobeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('Personal Globe');
  const [description, setDescription] = useState('Mis viajes personales');
  const [visibility, setVisibility] = useState('PUBLIC');

  const handleCreateGlobe = async () => {
    try {
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter a name for your globe');
        return;
      }

      const newGlobe = {
        name,
        description,
        visibility
      };

      console.log('Creating new globe:', newGlobe);
      const response = await globesService.createGlobe({
        name,
        description,
        visibility: visibility as 'PUBLIC' | 'PRIVATE' | 'FRIENDS'
      });
      console.log('Globe created successfully:', response);

      // Navigate to the AddTrip screen after creating the globe
      navigation.navigate('AddTrip', { 
        globeId: response.AlbumID || response.id
      });
    } catch (error) {
      console.error('Error creating globe:', error);
      Alert.alert('Error', 'Failed to create globe. Please try again.');
    }
  };

  const toggleVisibility = () => {
    setVisibility(visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <CustomTextRegular style={styles.backButton}>←</CustomTextRegular>
        </TouchableOpacity>
        <CustomTextRegular style={styles.headerTitle}>Create New Globe</CustomTextRegular>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.globeIconContainer}>
            <View style={styles.globeIconWrapper}>
              <Image
                  source={require('../assets/globeview.png')}
                  style={styles.globeIcon}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <CustomTextRegular style={styles.label}>Globe Name</CustomTextRegular>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter globe name"
              placeholderTextColor="#B3B3B3"
            />
          </View>

          <View style={styles.inputGroup}>
            <CustomTextRegular style={styles.label}>Description</CustomTextRegular>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor="#B3B3B3"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <CustomTextRegular style={styles.label}>Visibility</CustomTextRegular>
            <TouchableOpacity 
              style={styles.visibilityToggle}
              onPress={toggleVisibility}
            >
              <View style={[
                styles.toggleOption, 
                visibility === 'PUBLIC' && styles.activeToggleOption
              ]}>
                <CustomTextRegular style={[
                  styles.toggleText,
                  visibility === 'PUBLIC' && styles.activeToggleText
                ]}>Public</CustomTextRegular>
              </View>
              <View style={[
                styles.toggleOption, 
                visibility === 'PRIVATE' && styles.activeToggleOption
              ]}>
                <CustomTextRegular style={[
                  styles.toggleText,
                  visibility === 'PRIVATE' && styles.activeToggleText
                ]}>Private</CustomTextRegular>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateGlobe}
          >
            <CustomTextBold style={styles.createButtonText}>Create Globe</CustomTextBold>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  backButton: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    marginBottom: 60,
  },
  formContainer: {
    padding: 20,
  },
  globeIconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  globeIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 184, 232, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeIcon: {
    width:'70%',
    height:'70%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  visibilityToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  activeToggleOption: {
    backgroundColor: '#8BB8E8',
  },
  toggleText: {
    fontSize: 16,
    color: '#666',
  },
  activeToggleText: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#8BB8E8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default CreateGlobeScreen;