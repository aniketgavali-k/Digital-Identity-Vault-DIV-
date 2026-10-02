import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { ChevronLeft, Lock, Fingerprint, ShieldCheck, Smartphone, Eye, EyeOff } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const SecuritySettingsScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const { authSettings, updateAuthSetting } = useAuth();
  const Colors = isDark ? DarkTheme : LightTheme;
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    checkDeviceSupport();
  }, []);

  const checkDeviceSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);
  };

  const handleBiometricToggle = async (value) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric login',
      });
      if (result.success) {
        await updateAuthSetting('biometric', true);
        Alert.alert('Success', 'Biometric authentication enabled');
      }
    } else {
      await updateAuthSetting('biometric', false);
    }
  };

  const SecurityOption = ({ icon, title, subtitle, hasSwitch, value, onPress, onToggle }) => (
    <TouchableOpacity 
      style={styles.optionItem} 
      onPress={onPress} 
      disabled={hasSwitch}
    >
      <View style={[styles.iconBox, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>{icon}</View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: Colors.text }]}>{title}</Text>
        <Text style={[styles.optionSubtitle, { color: Colors.textLight }]}>{subtitle}</Text>
      </View>
      {hasSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onToggle} 
          trackColor={{ false: '#CBD5E1', true: Colors.primaryLight }} 
          thumbColor={value ? Colors.primary : '#F4F3F4'} 
        />
      ) : ( <ChevronLeft size={20} color={Colors.border} style={{ transform: [{ rotate: '180deg'}] }} /> )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ChevronLeft size={24} color={Colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Vault Security</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Authentication</Text>
        <View style={[styles.card, Shadows.soft, { backgroundColor: Colors.card }]}>
          <SecurityOption 
            icon={<Lock size={20} color={Colors.primary} />} 
            title="Master Key" 
            subtitle="Change access password" 
            onPress={() => navigation.navigate('ChangeMasterKey')}
          />
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          <SecurityOption 
            icon={<ShieldCheck size={20} color={Colors.primary} />} 
            title="Two-Factor Auth" 
            subtitle="Authenticator App / OTP"
            onPress={() => navigation.navigate('TwoFactorAuth')}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: Colors.text, marginTop: Spacing.xl }]}>Biometrics</Text>
        <View style={[styles.card, Shadows.soft, { backgroundColor: Colors.card }]}>
          <SecurityOption 
            icon={<Fingerprint size={20} color={Colors.primary} />} 
            title="Fingerprint / FaceID" 
            subtitle={isBiometricSupported ? "Use device biometrics" : "Not supported on this device"} 
            hasSwitch={true} 
            value={authSettings.biometric}
            onToggle={handleBiometricToggle}
          />
        </View>

        <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.1)' : '#EEF2FF' }]}>
            <Smartphone size={18} color={Colors.primary} />
            <Text style={[styles.infoText, { color: Colors.text }]}>Your biometric data never leaves your device and is managed by the OS security module.</Text>
        </View>

        <TouchableOpacity 
          style={[styles.activityBtn, { borderColor: Colors.primary }]}
          onPress={() => navigation.navigate('ActivityLogs')}
        >
          <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>View Security Activity Logs</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: Spacing.lg },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold', marginBottom: Spacing.md, marginLeft: 4 },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  optionItem: { flexDirection: 'row', paddingVertical: Spacing.md, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  optionContent: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600' },
  optionSubtitle: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginLeft: 56 },
  infoBox: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.md, alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 12, fontSize: 11, lineHeight: 16 },
  activityBtn: { marginTop: Spacing.xxl, height: 50, borderRadius: BorderRadius.md, borderWidth: 1, justifyContent: 'center', alignItems: 'center' }
});

export default SecuritySettingsScreen;
