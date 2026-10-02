import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Screens (To be created)
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import ShareScreen from '../screens/ShareScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import AppSettingsScreen from '../screens/AppSettingsScreen';
import DocumentDetailScreen from '../screens/DocumentDetailScreen';

import NotificationsScreen from '../screens/NotificationsScreen';
import ActivityLogsScreen from '../screens/ActivityLogsScreen';
import ChangeMasterKeyScreen from '../screens/ChangeMasterKeyScreen';
import TwoFactorAuthScreen from '../screens/TwoFactorAuthScreen';
import VerifierScreen from '../screens/VerifierScreen';
import OTPScreen from '../screens/OTPScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Documents" component={DocumentsScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="Share" component={ShareScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
          <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
          <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="ActivityLogs" component={ActivityLogsScreen} />
          <Stack.Screen name="ChangeMasterKey" component={ChangeMasterKeyScreen} />
          <Stack.Screen name="TwoFactorAuth" component={TwoFactorAuthScreen} />
          <Stack.Screen name="Verifier" component={VerifierScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
