import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Smartphone, ShieldCheck, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const TwoFactorAuthScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const { authSettings, updateAuthSetting, updateUser } = useAuth();
  const Colors = isDark ? DarkTheme : LightTheme;

  const handleToggle = async (value) => {
    try {
      await updateUser({ twoFactorEnabled: value });
      updateAuthSetting('twoFactor', value);
      
      if (value) {
        Alert.alert('Security Enhanced', 'Email OTP verification is now enabled for your account.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update security settings');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Two-Factor Authentication</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, Shadows.soft, { backgroundColor: Colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: Colors.text }]}>Enable 2FA Protection</Text>
              <Text style={[styles.settingDesc, { color: Colors.textLight }]}>Adds an extra layer of identity verification</Text>
            </View>
            <Switch 
              value={authSettings.twoFactor} 
              onValueChange={handleToggle}
              trackColor={{ false: '#CBD5E1', true: Colors.secondary }}
              thumbColor={authSettings.twoFactor ? '#FFF' : '#F4F3F4'}
            />
          </View>

          {authSettings.twoFactor && (
            <View style={styles.qrContainer}>
              <View style={styles.qrBox}>
                 {/* Simplified Mock QR Code using icons and lines */}
                 <View style={{ width: 150, height: 150, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
                    <Lock size={80} color={Colors.primary} />
                 </View>
              </View>
              <Text style={[styles.qrText, { color: Colors.text }]}>Secret Key: VAULT-ID-2FA-MOCK</Text>
              <Text style={[styles.qrHint, { color: Colors.textLight }]}>Enter this code manually if QR scan fails.</Text>
            </View>
          )}
        </View>

        <View style={styles.benefitSection}>
           <View style={styles.benefitItem}>
              <ShieldCheck size={20} color={Colors.secondary} />
              <Text style={[styles.benefitText, { color: Colors.text }]}>Protect against unauthorized key usage</Text>
           </View>
           <View style={styles.benefitItem}>
              <ShieldCheck size={20} color={Colors.secondary} />
              <Text style={[styles.benefitText, { color: Colors.text }]}>Device-specific authorization required</Text>
           </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: Spacing.lg },
  card: { padding: Spacing.lg, borderRadius: BorderRadius.lg },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingInfo: { flex: 1, marginRight: Spacing.md },
  settingTitle: { fontSize: 16, fontWeight: 'bold' },
  settingDesc: { fontSize: 12, marginTop: 4 },
  qrContainer: { alignItems: 'center', marginTop: Spacing.xxl },
  qrBox: { padding: 10, backgroundColor: '#F1F5F9', borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  qrText: { fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
  qrHint: { fontSize: 12, marginTop: 4 },
  benefitSection: { marginTop: Spacing.xxl },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  benefitText: { marginLeft: 12, fontSize: 14 },
});

export default TwoFactorAuthScreen;
