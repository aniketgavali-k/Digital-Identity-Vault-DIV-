import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, ChevronRight, Check } from 'lucide-react-native';
import { LightTheme as Colors, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [activeStep, setActiveStep] = useState(0);

  const slides = [
    {
      title: "Your Identity, Controlled.",
      subtitle: "The most secure vault for your personal certificates and IDs.",
      icon: <Shield size={80} color={Colors.primary} />,
      gradient: Colors.gradient
    },
    {
      title: "Universal Access",
      subtitle: "Share verified documents with anyone, anywhere, safely.",
      icon: <Check size={80} color={Colors.secondary} />,
      gradient: ['#10B981', '#059669']
    },
    {
      title: "Maximum Security",
      subtitle: "Advanced protection ensures only you can access your data.",
      icon: <Shield size={80} color={Colors.accent} />,
      gradient: ['#F59E0B', '#D97706']
    }
  ];

  const handleNext = () => {
    if (activeStep < slides.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <LinearGradient 
          colors={slides[activeStep].gradient} 
          style={styles.iconCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {slides[activeStep].icon}
        </LinearGradient>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.title}>{slides[activeStep].title}</Text>
        <Text style={styles.subtitle}>{slides[activeStep].subtitle}</Text>

        <View style={styles.indicatorContainer}>
          {slides.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.indicator, 
                i === activeStep && styles.indicatorActive,
                { backgroundColor: i === activeStep ? Colors.primary : Colors.border }
              ]} 
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <LinearGradient 
            colors={Colors.gradient} 
            style={styles.btnGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={styles.btnText}>
              {activeStep === slides.length - 1 ? "Secure My Vault" : "Continue"}
            </Text>
            <ChevronRight size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </LinearGradient>
        </TouchableOpacity>

        {activeStep < slides.length - 1 && (
          <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.skipText}>Skip Intro</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  topSection: { 
    height: height * 0.45, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomRightRadius: 100,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  bottomSection: { 
    flex: 1, 
    padding: Spacing.xl, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 16, lineHeight: 24 },
  indicatorContainer: { flexDirection: 'row', marginTop: 40, marginBottom: 40 },
  indicator: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  indicatorActive: { width: 24 },
  button: { width: '100%', height: 56, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
  skipBtn: { marginTop: 20 },
  skipText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
});

export default WelcomeScreen;
