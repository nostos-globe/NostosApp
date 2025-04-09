import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import PhotoViewScreen from './src/screens/PhotoViewScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddTripScreen from './src/screens/AddTripScreen';
import PhotoExploreScreen from './src/screens/PhotoExploreScreen';
import OtherProfileScreen from './src/screens/OtherProfileScreen';
import Globe3DView from './src/screens/Globe3DView';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Globe3DView" component={Globe3DView}/>
        <Stack.Screen name="Explore" component={ExploreScreen} />
        <Stack.Screen name="ExplorePhotoView" component={PhotoExploreScreen} />
        <Stack.Screen name="PhotoView" component={PhotoViewScreen} />
        <Stack.Screen name="AddTrip" component={AddTripScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="OtherProfile" component={OtherProfileScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;