import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { ChevronLeft, Moon, Bell, Globe, HelpCircle, Info, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const AppSettingsScreen = ({ navigation }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const Colors = isDark ? DarkTheme : LightTheme;

  const toggleVerifier = async (value) => {
    const newRole = value ? 'verifier' : 'user';
    await updateUser({ ...user, role: newRole });
  };
  const SettingItem = ({ icon, title, subtitle, hasSwitch, value, color, onToggle }) => (
    <View style={styles.settingItem}>
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: Colors.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: Colors.textLight }]}>{subtitle}</Text>
      </View>
      {hasSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onToggle}
          trackColor={{ false: '#CBD5E1', true: Colors.primaryLight }}
          thumbColor={value ? Colors.primary : '#F4F3F4'}
        />
      ) : (
        <ChevronLeft size={20} color="#CBD5E1" style={{ transform: [{ rotate: '180deg'}] }} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>App Preferences</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: Colors.textLight }]}>Appearance</Text>
        <View style={[styles.card, Shadows.soft, { backgroundColor: Colors.card }]}>
          <SettingItem 
            icon={<Moon size={20} color="#6366F1" />} 
            title="Dark Mode" 
            subtitle="Easy on your eyes"
            hasSwitch={true}
            value={isDark}
            onToggle={toggleTheme}
            color="#6366F1"
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl, color: Colors.textLight }]}>Exhibition Demo</Text>
        <View style={[styles.card, Shadows.soft, { backgroundColor: Colors.card }]}>
          <SettingItem 
            icon={<ShieldAlert size={20} color={Colors.primary} />} 
            title="Verifier Mode" 
            subtitle="Enable document review tools"
            hasSwitch={true}
            value={user?.role === 'verifier'}
            onToggle={toggleVerifier}
            color={Colors.primary}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl, color: Colors.textLight }]}>Configurations</Text>
        <View style={[styles.card, Shadows.soft, { backgroundColor: Colors.card }]}>
          <SettingItem 
            icon={<Bell size={20} color={Colors.accent} />} 
            title="Push Notifications" 
            subtitle="Alerts for verification"
            hasSwitch={true}
            value={true}
            color={Colors.accent}
          />
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          <SettingItem 
            icon={<Globe size={20} color={Colors.secondary} />} 
            title="Language" 
            subtitle="English (US)"
            color={Colors.secondary}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl, color: Colors.textLight }]}>Support & Info</Text>
        <View style={[styles.card, Shadows.soft, { backgroundColor: Colors.card }]}>
          <SettingItem 
            icon={<HelpCircle size={20} color="#8B5CF6" />} 
            title="Help Center" 
            subtitle="FAQs and User Guide"
            color="#8B5CF6"
          />
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          <SettingItem 
            icon={<Info size={20} color="#64748B" />} 
            title="About Vault" 
            subtitle="Legal, Privacy Policy, Terms"
            color="#64748B"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: Spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md },
  settingItem: { flexDirection: 'row', paddingVertical: Spacing.md, alignItems: 'center' },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: 'bold' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  divider: { height: 1 },
});

export default AppSettingsScreen;
