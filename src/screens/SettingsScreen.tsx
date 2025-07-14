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
import { requestNotificationPermission } from '../utils/permissions';
import CustomTextRegular from '../components/CustomTextRegular';
import CustomTextBold from '../components/CustomTextBold';

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
          <CustomTextBold style={styles.modalTitle}>{title}</CustomTextBold>
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
              <CustomTextRegular style={[
                styles.modalOptionText,
                selectedValue === option && styles.selectedOptionText
              ]}>
                {option}
              </CustomTextRegular>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setVisible(false)}
          >
            <CustomTextRegular style={styles.modalCloseText}>Cancel</CustomTextRegular>
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
        <CustomTextRegular style={styles.settingIcon}>{icon}</CustomTextRegular>
        <CustomTextRegular style={styles.settingText}>{title}</CustomTextRegular>
      </View>
      {rightElement || (showArrow && <CustomTextRegular style={styles.arrowIcon}>→</CustomTextRegular>)}
    </TouchableOpacity>
  );

  // Add this hook to handle notifications

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        setNotificationsEnabled(true);
      } else {
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <CustomTextBold style={styles.backButtonText}>←</CustomTextBold>
        </TouchableOpacity>
        <CustomTextBold style={styles.title}>Settings</CustomTextBold>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <CustomTextRegular style={styles.sectionTitle}>Account</CustomTextRegular>
          {renderSettingItem('', 'Private Account', () => {}, false,
            <Switch
              value={privateAccount}
              onValueChange={setPrivateAccount}
              trackColor={{ false: '#767577', true: '#8BB8E8' }}
              thumbColor={privateAccount ? '#fff' : '#f4f3f4'}
            />
          )}
        </View>

        <View style={styles.section}>
          <CustomTextRegular style={styles.sectionTitle}>Preferences</CustomTextRegular>
          {renderSettingItem('', `Language (${selectedLanguage})`, () => setShowLanguageModal(true))}
          {renderSettingItem('', `Theme (${selectedTheme})`, () => setShowThemeModal(true))}
          {renderSettingItem('', `Time Format (${selectedTimeFormat})`, () => setShowTimeFormatModal(true))}
        </View>

        <View style={styles.section}>
          <CustomTextRegular style={styles.sectionTitle}>Support</CustomTextRegular>
          {renderSettingItem('', 'Help Center', () => {})}
          {renderSettingItem('', 'Terms of Service', () => {})}
          {renderSettingItem('', 'Privacy Policy', () => {})}
        </View>

        <TouchableOpacity 
          style={[styles.settingItem, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <View style={styles.settingContent}>
            <CustomTextRegular style={styles.logoutText}>Logout</CustomTextRegular>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Selection Modal */}
      {renderModal(
        showLanguageModal,
        setShowLanguageModal,
        'Select Language',
        languages,
        selectedLanguage,
        (lang) => setSelectedLanguage(lang)
      )}

      {/* Theme Selection Modal */}
      {renderModal(
        showThemeModal,
        setShowThemeModal,
        'Select Theme',
        themes,
        selectedTheme,
        (theme) => setSelectedTheme(theme)
      )}

      {/* Time Format Selection Modal */}
      {renderModal(
        showTimeFormatModal,
        setShowTimeFormatModal,
        'Select Time Format',
        timeFormats,
        selectedTimeFormat,
        (format) => setSelectedTimeFormat(format)
      )}
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
    fontSize: 30,
    color: '#8BB8E8',
  },
  title: {
    fontSize: 20,
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
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FF3B30',
    fontSize: 16,
  },
});

export default SettingsScreen;