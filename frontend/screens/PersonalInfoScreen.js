import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { ChevronLeft, User, Mail, Smartphone, Check, Edit2, X } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const PersonalInfoScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name, phoneNumber: phone });
      updateUser(data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Update Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const InfoItem = ({ icon, label, value, isInput, onChangeText, placeholder, keyboardType }) => (
    <View style={styles.infoItem}>
      <View style={[styles.iconBox, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>{icon}</View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: Colors.textLight }]}>{label}</Text>
        {isInput ? (
          <TextInput 
            style={[styles.input, { color: Colors.text, borderBottomColor: Colors.primary }]} 
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={Colors.textLight}
            keyboardType={keyboardType}
            autoFocus={label === 'Full Name'}
          />
        ) : (
          <Text style={[styles.infoValue, { color: Colors.text }]}>{value || 'Not set'}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => (isEditing ? setIsEditing(false) : navigation.goBack())} style={styles.backBtn}>
          {isEditing ? <X size={24} color={Colors.text} /> : <ChevronLeft size={24} color={Colors.text} />}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>{isEditing ? 'Edit Profile' : 'Personal Details'}</Text>
        <TouchableOpacity 
          onPress={isEditing ? handleSave : () => setIsEditing(true)} 
          style={styles.editBtn}
          disabled={loading}
        >
          {loading ? <ActivityIndicator size="small" color={Colors.primary} /> : (
            isEditing ? <Check size={24} color={Colors.primary} /> : <Edit2 size={20} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={[styles.avatar, Shadows.medium, { backgroundColor: Colors.primary }]}>
            <Text style={styles.avatarText}>{name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={[styles.userName, { color: Colors.text }]}>{name}</Text>
          <Text style={[styles.userRole, { color: Colors.textLight }]}>Verified {user?.role}</Text>
        </View>

        <View style={[styles.infoCard, Shadows.soft, { backgroundColor: Colors.card }]}>
          <InfoItem 
            icon={<User size={20} color={Colors.primary} />} 
            label="Full Name" 
            value={name} 
            isInput={isEditing}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          <InfoItem 
            icon={<Mail size={20} color={Colors.primary} />} 
            label="Email Address" 
            value={user?.email} 
            isInput={false} 
          />
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          <InfoItem 
            icon={<Smartphone size={20} color={Colors.primary} />} 
            label="Phone Number" 
            value={phone} 
            isInput={isEditing}
            onChangeText={setPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  editBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: Spacing.lg },
  profileSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  avatarText: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userRole: { fontSize: 14, marginTop: 4 },
  infoCard: { borderRadius: BorderRadius.lg, padding: Spacing.md },
  infoItem: { flexDirection: 'row', paddingVertical: Spacing.md, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600' },
  input: { fontSize: 15, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 1 },
  divider: { height: 1 },
});

export default PersonalInfoScreen;
