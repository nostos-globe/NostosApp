import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { mediaService } from '../services/mediaService';
import NavigationBar from '../components/NavigationBar';
import { globesService, Globe } from '../services/globesService';
import { Picker } from '@react-native-picker/picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddTripScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const globeIdFromNav = (route.params as any)?.globeId;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'FRIENDS'>('PUBLIC');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [globes, setGlobes] = useState<Globe[]>([]);
  const [selectedGlobe, setSelectedGlobe] = useState<string>(globeIdFromNav || '');

  useEffect(() => {
    if (!globeIdFromNav) {
      fetchGlobes();
    }
  }, [globeIdFromNav]);

  const fetchGlobes = async () => {
    try {
      const userGlobes = await globesService.getMyGlobes();
      setGlobes(userGlobes);
      if (userGlobes.length > 0) {
        setSelectedGlobe(userGlobes[0].AlbumID.toString());
      }
    } catch (error) {
      console.error('Error fetching globes:', error);
    }
  };

  const handleCreateTrip = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a trip name');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Error', 'End date cannot be before start date');
      return;
    }

    if (!selectedGlobe) {
      Alert.alert('Error', 'Please select a globe');
      return;
    }

    setIsLoading(true);

    try {
      const tripData = {
        name,
        description,
        visibility,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        album_id: selectedGlobe
      };

      // Call your API to create the trip
      const response = await mediaService.createTrip(tripData);
      
      Alert.alert(
        'Success',
        'Trip created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to profile or to the new trip
              navigation.navigate('Profile' as never);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Trip</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView 
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Trip Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter trip name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter trip description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'PUBLIC' && styles.selectedVisibility
              ]}
              onPress={() => setVisibility('PUBLIC')}
            >
              <Text style={styles.visibilityText}>🌐 Public</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'FRIENDS' && styles.selectedVisibility
              ]}
              onPress={() => setVisibility('FRIENDS')}
            >
              <Text style={styles.visibilityText}>👥 Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'PRIVATE' && styles.selectedVisibility
              ]}
              onPress={() => setVisibility('PRIVATE')}
            >
              <Text style={styles.visibilityText}>🔒 Private</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}
        </View>

        {!globeIdFromNav && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Globe</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedGlobe}
                onValueChange={(itemValue) => setSelectedGlobe(itemValue)}
                style={styles.picker}
              >
                {globes.map((globe) => (
                  <Picker.Item 
                    key={globe.AlbumID} 
                    label={globe.name} 
                    value={globe.AlbumID.toString()} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.disabledButton]}
          onPress={handleCreateTrip}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? 'Creating...' : 'Create Trip'}
          </Text>
        </TouchableOpacity>
        
        {globeIdFromNav && (
          <TouchableOpacity
            style={[styles.notNowButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.notNowText}>Not now</Text>
          </TouchableOpacity>
        )}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80, 
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
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
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visibilityOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#f9f9f9',
  },
  selectedVisibility: {
    borderColor: '#8BB8E8',
    backgroundColor: '#e6f2ff',
  },
  visibilityText: {
    fontSize: 14,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
  },
  notNowButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 40,

  },
  notNowText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#8BB8E8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default AddTripScreen;