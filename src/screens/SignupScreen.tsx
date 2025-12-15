import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import { Alert } from 'react-native';
import CustomTextRegular from '../components/CustomTextRegular';
import CustomTextBold from '../components/CustomTextBold';

const SignupScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.signup({ email, password });
            'Signup successful:', response);
            navigation.navigate('CreateProfile' as never);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

  const handleSignUp = () => {
    // Implement sign up logic here
    'Sign up:', email, password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/nostos_logo.png')}
          style={styles.logoItem}
        />
        <CustomTextBold style={styles.title}>Let's Get Started</CustomTextBold>
        <CustomTextRegular style={styles.subtitle}>
          Start your journey with Nostos and share all your trip moments with the world
        </CustomTextRegular>

        <CustomTextRegular style={styles.inputText}>Your email address</CustomTextRegular>
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="#B3B3B3"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomTextRegular style={styles.inputText}>Choose a password</CustomTextRegular>
        <TextInput
          style={styles.input}
          placeholder="8 characters min."
          placeholderTextColor="#B3B3B3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
      {/* 
        <Text style={styles.orText}>OR</Text>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#fff' }]} />
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#DD4B39' }]} />
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#4267B2' }]} />
        </View> 
      */}

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignup}>
          <CustomTextBold style={styles.signUpText}>Sign Up</CustomTextBold>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <CustomTextRegular style={styles.loginText}>Do you have an account? </CustomTextRegular>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <CustomTextBold style={styles.loginLink}>Log In</CustomTextBold>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    color: '#A7C7E7',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    fontFamily:'OutfitRegular',
    borderWidth: 1,
    borderColor: '#8E8E8E',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  orText: {
    color: '#666',
    marginVertical: 20,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  signUpButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#8BB8E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#000',
    fontWeight: 'bold',
  },
  logoItem: {
    width: 215,
    height: 180,
    marginBottom: 20, 
    justifyContent: 'center',
    alignSelf: 'center', 
  },
  inputText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2, 
  }
});

export default SignupScreen;