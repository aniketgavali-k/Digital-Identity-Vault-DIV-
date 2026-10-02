import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authSettings, setAuthSettings] = useState({ biometric: false, twoFactor: false });

  useEffect(() => {
    checkLoginStatus();
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const bio = await SecureStore.getItemAsync('biometric_enabled');
      const tfa = await SecureStore.getItemAsync('2fa_enabled');
      setAuthSettings({
        biometric: bio === 'true',
        twoFactor: tfa === 'true'
      });
    } catch (e) {
      console.log('Error loading security settings:', e);
    }
  };

  const updateAuthSetting = async (key, value) => {
    try {
      setAuthSettings(prev => ({ ...prev, [key]: value }));
      const storeKey = key === 'biometric' ? 'biometric_enabled' : '2fa_enabled';
      await SecureStore.setItemAsync(storeKey, value ? 'true' : 'false');
    } catch (e) {
      console.log('Error updating security setting:', e);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.status === 'VERIFICATION_REQUIRED' || data.status === '2FA_REQUIRED') {
        return data; // Return to screen for navigation to OTP
      }

      setUser(data);
      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, phoneNumber) => {
    try {
      console.log('Finalizing registration request for:', email);
      const { data } = await api.post('/auth/register', { name, email, password, phoneNumber });
      console.log('Register response data:', data);
      
      if (data.status === 'PENDING_VERIFICATION') {
        return data; // Return to screen for navigation to OTP
      }

      // Only set user if we actually have a successful login token
      if (data.token) {
        setUser(data);
        await SecureStore.setItemAsync('token', data.token);
        await SecureStore.setItemAsync('user', JSON.stringify(data));
        return { success: true };
      }
      
      return data;
    } catch (error) {
      console.log('Registration error details:', error.message);
      throw error;
    }
  };

  const verifyOTP = async (email, otpCode) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otpCode });
      setUser(data);
      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const resendOTP = async (email) => {
    try {
      const { data } = await api.post('/auth/resend-otp', { email });
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (userData) => {
    try {
      const { data } = await api.put('/auth/profile', userData);
      setUser(data);
      await SecureStore.setItemAsync('user', JSON.stringify(data));
    } catch (error) {
      console.log('Update user error:', error);
      // Fallback to local update if API fails (for offline demo)
      setUser(userData);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
    }
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOTP, resendOTP, logout, updateUser, authSettings, updateAuthSetting }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
