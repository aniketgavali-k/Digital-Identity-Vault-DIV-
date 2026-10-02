import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Lock, Mail, ChevronRight, ArrowLeft, Smartphone } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  const handleRegister = async () => {
    if (loading) return;
    
    try {
      if (!name || !email || !password || !phone) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      // Email validation regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }

      setLoading(true);
      const result = await register(name, email, password, phone);
      
      if (result?.status === 'PENDING_VERIFICATION') {
        navigation.navigate('OTP', { 
          email: result.email, 
          purpose: result.status 
        });
      }
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.title, { color: Colors.text }]}>Secure Identity</Text>
          <Text style={[styles.subtitle, { color: Colors.textLight }]}>Join Digital Vault to protect your world</Text>

          <View style={styles.form}>
            <View style={[styles.inputContainer, Shadows.soft, { backgroundColor: Colors.card }]}>
              <User size={20} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: Colors.text }]}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Colors.textLight}
              />
            </View>

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
              <Smartphone size={20} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: Colors.text }]}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={[styles.inputContainer, Shadows.soft, { backgroundColor: Colors.card }]}>
              <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: Colors.text }]}
                placeholder="Master Key (Password)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <Text style={[styles.termsText, { color: Colors.textLight }]}>
              By creating an account, you agree to our <Text style={[styles.link, { color: Colors.primary }]}>Terms</Text> and <Text style={[styles.link, { color: Colors.primary }]}>Privacy</Text>.
            </Text>

            <TouchableOpacity style={styles.regBtn} onPress={handleRegister}>
              <LinearGradient colors={Colors.gradientEmerald} style={styles.regGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.regText}>Establish Identity</Text>
                <ChevronRight size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: Colors.textLight }]}>Already have identity? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginText, { color: Colors.secondary }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { padding: Spacing.lg },
  scrollContent: { padding: Spacing.xl },
  title: { fontSize: 32, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 8, marginBottom: 40 },
  form: { flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.lg, paddingHorizontal: 16, marginBottom: Spacing.md, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  termsText: { fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 32 },
  link: { fontWeight: 'bold' },
  regBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', height: 56 },
  regGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  regText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 15 },
  loginText: { fontSize: 15, fontWeight: 'bold' },
});

export default RegisterScreen;
