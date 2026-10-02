import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Lock, ShieldCheck, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const ChangeMasterKeyScreen = ({ navigation }) => {
  const [currentKey, setCurrentKey] = useState('');
  const [newKey, setNewKey] = useState('');
  const [confirmKey, setConfirmKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  const handleUpdate = () => {
    if (!currentKey || !newKey || !confirmKey) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (newKey !== confirmKey) {
      Alert.alert('Error', 'New keys do not match');
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Master Key updated securely', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Reset Master Key</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.1)' : '#EEF2FF' }]}>
            <ShieldCheck size={20} color={Colors.primary} />
            <Text style={[styles.infoText, { color: Colors.text }]}>Changing your Master Key will re-encrypt all vault access tokens.</Text>
        </View>

        <Text style={[styles.label, { color: Colors.text }]}>Current Master Key</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: Colors.card, color: Colors.text, borderColor: Colors.border }]} 
          secureTextEntry 
          value={currentKey}
          onChangeText={setCurrentKey}
          placeholder="Enter current key"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={[styles.label, { color: Colors.text, marginTop: Spacing.lg }]}>New Master Key</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: Colors.card, color: Colors.text, borderColor: Colors.border }]} 
          secureTextEntry 
          value={newKey}
          onChangeText={setNewKey}
          placeholder="Min 8 characters"
          placeholderTextColor={Colors.textLight}
        />

        <Text style={[styles.label, { color: Colors.text, marginTop: Spacing.lg }]}>Confirm New Key</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: Colors.card, color: Colors.text, borderColor: Colors.border }]} 
          secureTextEntry 
          value={confirmKey}
          onChangeText={setConfirmKey}
          placeholder="Repeat new key"
          placeholderTextColor={Colors.textLight}
        />

        <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={loading}>
          <LinearGradient colors={Colors.gradient} style={styles.btnGradient}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Text style={styles.btnText}>Apply Changes</Text>
                <Check size={20} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
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
  infoBox: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.xl, alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 12, fontSize: 13, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: Spacing.sm },
  input: { height: 56, borderRadius: BorderRadius.md, paddingHorizontal: 16, borderWidth: 1, fontSize: 16 },
  btn: { marginTop: Spacing.xxl, height: 56, borderRadius: BorderRadius.md, overflow: 'hidden' },
  btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
});

export default ChangeMasterKeyScreen;
