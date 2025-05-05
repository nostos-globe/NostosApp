import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { profileService } from '../services/profileService';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { ScrollView } from 'react-native'; // Add this import

const CreateProfileScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [theme, setTheme] = useState('light');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const languages = ['en', 'es', 'fr', 'de', 'it'];

  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
        includeBase64: false,
      });
  
      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }
  
      const selectedImage = result.assets[0];
      if (!selectedImage.uri) {
        throw new Error('No image URI available');
      }
  
      setProfilePicture(selectedImage.uri);
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      await profileService.createProfile({
        Username: username,
        Bio: bio,
        ProfilePicture: profilePicture,
        Theme: theme,
        Location: location,
        Website: website,
        Birthdate: birthdate,
        Language: language
      });
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'CreateGlobe' as never }],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us a little about yourself
          </Text>
  
          {/* Move profile picture selector to top */}
          <TouchableOpacity onPress={handleImageUpload} style={styles.avatarContainer}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>+</Text>
              </View>
            )}
          </TouchableOpacity>
  
          <TextInput
            style={styles.input}
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
  
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Write something about yourself..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
  
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
          />
  
          <TextInput
            style={styles.input}
            placeholder="Website URL"
            value={website}
            onChangeText={setWebsite}
            keyboardType="url"
          />
  
  <TouchableOpacity 
      style={styles.input} 
      onPress={() => setShowDatePicker(true)}
    >
      <Text style={!birthdate ? styles.placeholderText : styles.selectedText} >{birthdate || 'Select Birthdate'}</Text>
    </TouchableOpacity>
    {showDatePicker && (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={(event, date) => {
          setShowDatePicker(false);
          if (date) {
            setSelectedDate(date);
            setBirthdate(date.toISOString().split('T')[0]);
          }
        }}
        maximumDate={new Date()}
      />
    )}
  
  
  <TouchableOpacity 
      style={styles.input} 
      onPress={() => setShowLanguageModal(true)}
    >
      <Text style={language === 'en' ? styles.placeholderText : styles.selectedText}>{language || 'Select Language'}</Text>
    </TouchableOpacity>
  
  <Modal
    visible={showLanguageModal}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setShowLanguageModal(false)}
  >
    <TouchableWithoutFeedback onPress={() => setShowLanguageModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={styles.modalOption}
              onPress={() => {
                setLanguage(lang);
                setShowLanguageModal(false);
              }}
            >
              <Text>{lang}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
  
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleCreateProfile}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating Profile...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Update the input style to include text centering
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Adjust as needed
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8BB8E8',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'center', // Add this to center vertically
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#8BB8E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  placeholderText: {
    color: '#999', // Lighter color for placeholder
  },
  selectedText: {
    color: '#000', // Normal color for selected value
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 5,
    color: '#666',
    fontSize: 14,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 36,
    color: '#8BB8E8',
  },

});

export default CreateProfileScreen;