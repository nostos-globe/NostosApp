import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { authService } from '../services/authService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showTimeFormatModal, setShowTimeFormatModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedTheme, setSelectedTheme] = useState('Light');
  const [selectedTimeFormat, setSelectedTimeFormat] = useState('24h');

  const languages = ['English', 'Español', 'Català', 'Français', 'Deutsch'];
  const themes = ['Light', 'Dark', 'System'];
  const timeFormats = ['12h', '24h'];

  const renderModal = (
    visible: boolean,
    setVisible: (value: boolean) => void,
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modalOption,
                selectedValue === option && styles.selectedOption
              ]}
              onPress={() => {
                onSelect(option);
                setVisible(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                selectedValue === option && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    onPress: () => void,
    showArrow: boolean = true,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingText}>{title}</Text>
      </View>
      {rightElement || (showArrow && <Text style={styles.arrowIcon}>→</Text>)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderSettingItem('👤', 'Edit Profile', () => navigation.navigate('Profile'))}
          {renderSettingItem('🔒', 'Privacy', () => {}, true)}
          {renderSettingItem('🔐', 'Private Account', () => {}, false,
            <Switch
              value={privateAccount}
              onValueChange={setPrivateAccount}
              trackColor={{ false: '#767577', true: '#8BB8E8' }}
              thumbColor={privateAccount ? '#fff' : '#f4f3f4'}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderSettingItem('🔔', 'Notifications', () => {}, false,
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#8BB8E8' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          )}
          {renderSettingItem('🌍', `Language (${selectedLanguage})`, () => setShowLanguageModal(true))}
          {renderSettingItem('🎨', `Theme (${selectedTheme})`, () => setShowThemeModal(true))}
          {renderSettingItem('🕐', `Time Format (${selectedTimeFormat})`, () => setShowTimeFormatModal(true))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderSettingItem('❓', 'Help Center', () => {})}
          {renderSettingItem('📝', 'Terms of Service', () => {})}
          {renderSettingItem('🔏', 'Privacy Policy', () => {})}
        </View>

        <TouchableOpacity 
          style={[styles.settingItem, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Add these new styles to the existing StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 16,
    color: '#8BB8E8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#000',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#999',
  },
  logoutButton: {
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: '#f0f8ff',
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#8BB8E8',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;