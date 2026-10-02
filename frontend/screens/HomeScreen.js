import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Shield, Plus, FileText, Share2, Bell, Search, Info, ShieldCheck, Lock } from 'lucide-react-native';
import FadeInView from '../components/FadeInView';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, authSettings } = useAuth();
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;
  const [docCount, setDocCount] = useState(0);

  const vaultScore = (authSettings?.biometric ? 40 : 0) + (authSettings?.twoFactor ? 40 : 0) + 20;
  const vaultStatus = vaultScore >= 100 ? 'MAXIMUM SECURITY' : vaultScore >= 60 ? 'SECURE' : 'ACTION REQUIRED';
  const vaultStatusColor = vaultScore >= 100 ? Colors.secondary : vaultScore >= 60 ? Colors.primary : Colors.danger;

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/documents/my-documents');
      setDocCount(data.length);
    } catch (error) {
       console.error('Stats error:', error);
    }
  };

  const tips = [
    { id: '1', title: 'Always use 2FA', icon: <Lock size={20} color={Colors.primary} />, desc: 'Add an extra layer of security to your vault.' },
    { id: '2', title: 'Check Access Logs', icon: <ShieldCheck size={20} color={Colors.secondary} />, desc: 'Review when and where your docs were accessed.' },
    { id: '3', title: 'Keep IDs Updated', icon: <Info size={20} color={Colors.accent} />, desc: 'Ensure your document versions are current.' },
  ];

  const ActionCard = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.actionCard, Shadows.soft, { backgroundColor: Colors.card }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={[styles.actionTitle, { color: Colors.text }]}>{title}</Text>
      <Text style={[styles.actionSubtitle, { color: Colors.textLight }]}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <LinearGradient 
          colors={Colors.gradient} 
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>{user?.name?.charAt(0)}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Documents')}>
                <Search size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Notifications')}>
                <Bell size={20} color="#FFF" />
                <View style={[styles.notificationDot, { borderColor: Colors.primary }]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerGreeting}>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userNameText}>{user?.name || 'User'}</Text>
          </View>

          <View style={[styles.statsContainer, Shadows.medium, { backgroundColor: Colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: Colors.textLight }]}>Vault Status</Text>
              <Text style={[styles.statValue, { color: Colors.text }]}>{vaultStatus}</Text>
              <View style={styles.statBarContainer}>
                <View style={[styles.statBar, { width: `${vaultScore}%`, backgroundColor: vaultStatusColor }]} />
              </View>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: Colors.textLight }]}>Documents</Text>
              <Text style={[styles.statValue, { color: Colors.text }]}>{docCount}</Text>
              <Text style={styles.statSubValue}>Secured</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <FadeInView delay={200} style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Quick Operations</Text>
          <View style={styles.actionGrid}>
            <ActionCard 
              icon={<Plus size={24} color={Colors.primary} />} 
              title="Add New" 
              subtitle="Upload Doc"
              color={Colors.primary}
              onPress={() => navigation.navigate('Upload')}
            />
            <ActionCard 
              icon={<FileText size={24} color={Colors.secondary} />} 
              title="Vault" 
              subtitle="Access Records"
              color={Colors.secondary}
              onPress={() => navigation.navigate('Documents')}
            />
          </View>
        </FadeInView>

        {/* Verifier Portal (Special Demo Access) */}
        {user?.role === 'verifier' && (
          <FadeInView delay={300} style={styles.sectionContainer}>
            <TouchableOpacity 
              style={[styles.verifierCard, Shadows.medium, { backgroundColor: Colors.card }]}
              onPress={() => navigation.navigate('Verifier')}
            >
              <LinearGradient 
                colors={['#4F46E5', '#3730A3']} 
                style={styles.verifierGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Shield size={24} color="#FFF" />
                <View style={styles.verifierTextContainer}>
                  <Text style={styles.verifierTitle}>Verifier Portal</Text>
                  <Text style={styles.verifierSubtitle}>Review and verify pending documents</Text>
                </View>
                <Plus size={20} color="#FFF" style={{ transform: [{ rotate: '45deg'}] }} />
              </LinearGradient>
            </TouchableOpacity>
          </FadeInView>
        )}

        {/* Security Tips Carousel */}
        <FadeInView delay={400} style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Security Insights</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={tips}
            renderItem={({ item }) => (
              <View style={[styles.tipCard, Shadows.soft, { backgroundColor: Colors.card }]}>
                <View style={styles.tipHeader}>
                  {item.icon}
                  <Text style={[styles.tipTitle, { color: Colors.text }]}>{item.title}</Text>
                </View>
                <Text style={[styles.tipDesc, { color: Colors.textLight }]}>{item.desc}</Text>
              </View>
            )}
            keyExtractor={item => item.id}
          />
        </FadeInView>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.text, marginBottom: 0 }]}>Activity logs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ActivityLogs')}>
              <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.notifCard, Shadows.soft, { backgroundColor: Colors.card }]}
            onPress={() => navigation.navigate('ActivityLogs')}
          >
            <View style={[styles.notifIcon, { backgroundColor: `${Colors.primary}15` }]}>
              <Shield size={18} color={Colors.primary} />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, { color: Colors.text }]}>Vault Identity Active</Text>
              <Text style={[styles.notifDesc, { color: Colors.textLight }]}>Secure monitoring active for current session.</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: 60,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarMiniText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  headerIcons: { flexDirection: 'row' },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  notificationDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
  },
  headerGreeting: { marginBottom: Spacing.xl },
  greetingText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 },
  userNameText: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  statsContainer: {
    position: 'absolute',
    bottom: -35,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    zIndex: 10,
  },
  statItem: { flex: 1, justifyContent: 'center' },
  statDivider: { width: 1, marginHorizontal: Spacing.md },
  statLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 17, fontWeight: 'bold', marginVertical: 4 },
  statSubValue: { fontSize: 10, color: '#10B981', fontWeight: 'bold' },
  statBarContainer: { height: 4, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2, marginTop: 4 },
  statBar: { height: '100%', borderRadius: 2 },
  sectionContainer: { marginTop: 60, paddingHorizontal: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: Spacing.md },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  actionTitle: { fontSize: 15, fontWeight: 'bold' },
  actionSubtitle: { fontSize: 11, marginTop: 4 },
  tipCard: { width: width * 0.7, padding: Spacing.md, borderRadius: BorderRadius.lg, marginRight: Spacing.md },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tipTitle: { fontSize: 15, fontWeight: 'bold', marginLeft: 10 },
  tipDesc: { fontSize: 13, lineHeight: 18 },
  notifCard: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.lg, alignItems: 'center' },
  notifIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: 'bold' },
  notifDesc: { fontSize: 12, marginTop: 2 },
  verifierCard: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  verifierGradient: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  verifierTextContainer: { flex: 1, marginLeft: 16 },
  verifierTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  verifierSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, marginTop: 2 },
});

export default HomeScreen;
