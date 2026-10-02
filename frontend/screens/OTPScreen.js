import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const OTPScreen = ({ route, navigation }) => {
  const { email, purpose } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const { verifyOTP, resendOTP } = useAuth();
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;
  
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text, index) => {
    if (text.length > 1) {
      // Handle paste
      const digits = text.split('').slice(0, 6);
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the full 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      await verifyOTP(email, otpCode);
      // AuthContext will update user state and AppNavigator will auto-redirect to Home
    } catch (error) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'The code you entered is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer === 0) {
      try {
        setLoading(true);
        await resendOTP(email);
        setTimer(60); // Reset timer to 60 seconds after resend
        Alert.alert('Code Resent', `A new verification code has been sent to ${email}`);
      } catch (error) {
        Alert.alert('Error', 'Failed to resend the code. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: `${Colors.primary}10` }]}>
            <ShieldCheck size={40} color={Colors.primary} />
          </View>

          <Text style={[styles.title, { color: Colors.text }]}>Verify Your Identity</Text>
          <Text style={[styles.subtitle, { color: Colors.textLight }]}>
            We've sent a 6-digit security code to{'\n'}
            <Text style={{ fontWeight: 'bold', color: Colors.text }}>{email}</Text>
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[
                  styles.otpInput, 
                  Shadows.soft, 
                  { 
                    backgroundColor: Colors.card, 
                    color: Colors.text,
                    borderColor: digit !== '' ? Colors.primary : Colors.border,
                    borderWidth: digit !== '' ? 2 : 1
                  }
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                ref={(ref) => (inputRefs.current[index] = ref)}
                autoFocus={index === 0}
              />
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.verifyBtn, loading && { opacity: 0.7 }]} 
            onPress={handleVerify}
            disabled={loading}
          >
            <LinearGradient colors={Colors.gradient} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Confirm & Authorize</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: Colors.textLight }]}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
              <Text style={[styles.resendLink, { color: timer > 0 ? Colors.textLight : Colors.primary }]}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.md },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: Spacing.xl, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: Spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
  otpInput: { width: 48, height: 60, borderRadius: BorderRadius.md, fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  verifyBtn: { width: '100%', height: 56, borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: 20 },
  btnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  resendContainer: { flexDirection: 'row', marginTop: 30, alignItems: 'center' },
  resendText: { fontSize: 14 },
  resendLink: { fontSize: 14, fontWeight: 'bold' },
});

export default OTPScreen;
