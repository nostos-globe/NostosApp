import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authService';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE } from '../config/variables';
import CustomTextRegular from '../components/CustomTextRegular';
import CustomTextBold from '../components/CustomTextBold';


const LoginScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            
            // Store the token safely
            if (response.token) {
                try {
                    await AsyncStorage.setItem(AUTH_STORAGE.TOKEN, response.token);
                } catch (storageError) {
                    console.error('Failed to store token:', storageError);
                }
            } 

            // Navigate to Home screen after successful login
            navigation.navigate('Home' as never);
        } 
        catch (error: any) {
            Alert.alert('Login failed', "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/nostos_logo.png')}
          style={styles.logoItem}
        />
        <CustomTextBold style={styles.title}>Log In</CustomTextBold>
        <CustomTextRegular style={styles.subtitle}>Nice to see you again !</CustomTextRegular>
        <CustomTextRegular style={styles.inputText}>Email Address</CustomTextRegular>
        <TextInput
          style={styles.input}
          placeholder="example@gmail.com"
          placeholderTextColor="#B3B3B3"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomTextRegular style={styles.inputText}>Password</CustomTextRegular>
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
  
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <CustomTextBold style={styles.loginText}>Log In</CustomTextBold>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <CustomTextRegular style={styles.signUpText}>Don't have an account? </CustomTextRegular>
          <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
            <CustomTextBold style={styles.signUpLink}>Sign Up</CustomTextBold>
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
        lineHeight: 35,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 14,
        color: '#000000',
        textAlign: 'left',
        lineHeight: 18,
        marginBottom: 30,
    },
    inputText: {
        fontSize: 14,
        color: '#000000',
        marginBottom: 2,
    },
    input: {
        fontFamily:'OutfitRegular',
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#B3B3B3',
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
    logoItem: {
        width: 215,
        height: 180,
        marginBottom: 20,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    loginButton: {
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
    loginText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signUpContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    signUpText: {
        color: '#666',
    },
    signUpLink: {
        color: '#000',
    }
});

export default LoginScreen;