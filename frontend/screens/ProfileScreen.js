import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Shield, User, Settings as SettingsIcon, ChevronRight, Lock, Bell, Moon, Sun } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to exit your secure vault?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const MenuItem = ({ icon, title, subtitle, onPress, color }) => (
    <TouchableOpacity 
      style={[styles.menuItem, Shadows.soft, { backgroundColor: Colors.card }]} 
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${color}10` }]}>{icon}</View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: Colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: Colors.textLight }]}>{subtitle}</Text>}
      </View>
      <ChevronRight size={18} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient 
          colors={Colors.gradient} 
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.avatarContainer, Shadows.medium]}>
            <View style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.4)' }]}>
              <Text style={[styles.avatarText, { color: isDark ? '#FFF' : Colors.primary }]}>{user?.name?.charAt(0)}</Text>
            </View>
            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: Colors.secondary }]} onPress={toggleTheme}>
              {isDark ? <Sun size={14} color="#FFF" /> : <Moon size={14} color="#FFF" />}
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.roleBadge}>
              <Shield size={12} color="#FFF" />
              <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: Colors.textLight }]}>Vault Management</Text>
          <MenuItem 
            icon={<User size={20} color={Colors.primary} />} 
            title="Personal Details" 
            subtitle="Secure identity info"
            color={Colors.primary}
            onPress={() => navigation.navigate('PersonalInfo')}
          />
          <MenuItem 
            icon={<Lock size={20} color={Colors.secondary} />} 
            title="Vault Security" 
            subtitle="Keys & Biometrics"
            color={Colors.secondary}
            onPress={() => navigation.navigate('SecuritySettings')}
          />
          <MenuItem 
            icon={<SettingsIcon size={20} color={Colors.accent} />} 
            title="App Settings" 
            subtitle="Theme & Alerts"
            color={Colors.accent}
            onPress={() => navigation.navigate('AppSettings')}
          />

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <View style={[styles.logoutInner, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FFF1F2' }]}>
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Close Vault</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.versionHeader}>Vault v1.0.0 Product Build</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingBottom: 40,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  avatarContainer: { position: 'relative', marginBottom: Spacing.md },
  avatar: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#FFF', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold' },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  email: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  badgeContainer: { marginTop: Spacing.md },
  roleBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  roleText: { marginLeft: 8, fontSize: 11, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  content: { padding: Spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '800', marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: Spacing.md, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.md,
  },
  menuIcon: { 
    width: 44, 
    height: 44, 
    borderRadius: BorderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: Spacing.md,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600' },
  menuSubtitle: { fontSize: 12, marginTop: 2 },
  logoutBtn: { marginTop: Spacing.xl, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  logoutInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16 },
  logoutText: { marginLeft: 12, fontSize: 16, fontWeight: 'bold', color: '#EF4444' },
  versionHeader: { textAlign: 'center', fontSize: 11, color: '#94A3B8', marginTop: Spacing.xxl, marginBottom: Spacing.lg },
});

export default ProfileScreen;
