import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, Mail, ChevronRight, Shield } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }
      const result = await login(email, password);
      
      if (result?.status === 'VERIFICATION_REQUIRED' || result?.status === '2FA_REQUIRED') {
        navigation.navigate('OTP', { 
          email: result.email, 
          purpose: result.status 
        });
      } else if (result?.success) {
        // AuthContext already handled navigation via State update
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.topSection, { backgroundColor: isDark ? Colors.card : '#F8FAFC' }]}>
          <LinearGradient colors={Colors.gradient} style={styles.logoCircle}>
            <Shield size={60} color="#FFF" />
          </LinearGradient>
          <Text style={[styles.title, { color: Colors.text }]}>Digital Vault</Text>
          <Text style={[styles.subtitle, { color: Colors.textLight }]}>Enter your secure space</Text>
        </View>

        <View style={[styles.formSection, { backgroundColor: Colors.background }]}>
          <View style={[styles.inputContainer, Shadows.soft, { backgroundColor: Colors.card }]}>
            <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: Colors.text }]}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={[styles.inputContainer, Shadows.soft, { backgroundColor: Colors.card }]}>
            <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: Colors.text }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: Colors.primary }]}>Forgot Master Key?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <LinearGradient colors={Colors.gradient} style={styles.loginGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.loginText}>Open Vault</Text>
              <ChevronRight size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: Colors.textLight }]}>New to Vault? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.signupText, { color: Colors.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSection: { height: height * 0.38, justifyContent: 'center', alignItems: 'center', borderBottomLeftRadius: 60 },
  logoCircle: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg, elevation: 8 },
  title: { fontSize: 32, fontWeight: 'bold', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, marginTop: 4 },
  formSection: { padding: Spacing.xl, marginTop: -30, flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, paddingHorizontal: 16, marginBottom: Spacing.md, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: Spacing.xl },
  forgotText: { fontSize: 14, fontWeight: '600' },
  loginBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', height: 56, marginTop: Spacing.md },
  loginGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loginText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 15 },
  signupText: { fontSize: 15, fontWeight: 'bold' },
});

export default LoginScreen;
