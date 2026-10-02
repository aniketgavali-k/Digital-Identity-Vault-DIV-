import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Bell, ArrowLeft, Shield, Calendar, ChevronRight } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.notifCard, Shadows.soft, { backgroundColor: Colors.card }]}>
      <View style={[styles.iconBox, { backgroundColor: `${Colors.primary}15` }]}>
        <Bell size={20} color={Colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.notifTitle, { color: Colors.text }]}>{item.message}</Text>
        <Text style={[styles.notifDate, { color: Colors.textLight }]}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Bell size={48} color={Colors.textLight} opacity={0.3} />
              <Text style={{ color: Colors.textLight, marginTop: 16 }}>No notifications yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  list: { padding: Spacing.lg },
  notifCard: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  content: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  notifDate: { fontSize: 11, marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default NotificationsScreen;
