import React, { useState } from 'react';
import {
  View,
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


const WelcomeScreen = () => {
    const navigation = useNavigation();
    return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../assets/nostos_logo.png')}
          style={styles.logoItem}
        />
        <CustomTextBold style={styles.title}>Nostos</CustomTextBold>
        <CustomTextRegular style={styles.subtitle}>Create your travel album, save your best moments, and share them with friends and family.</CustomTextRegular>




        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Signup' as never)}>
          <CustomTextBold style={styles.loginText}>Get Started</CustomTextBold>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <CustomTextRegular style={styles.signUpText}>Do you have an account?  </CustomTextRegular>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <CustomTextBold style={styles.signUpLink}>Log In</CustomTextBold>
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
        alignItems:'center',
    },
    title: {
        fontSize: 60,
        color: '#A7C7E7',
        marginBottom: 30,
        lineHeight: 55,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#000000',
        width:"80%",
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 80,
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

export default WelcomeScreen;