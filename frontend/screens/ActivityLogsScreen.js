import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Shield, Clock, Smartphone, Globe } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const ActivityLogsScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  const logs = [
    { id: '1', title: 'Vault Login', desc: 'Success from iPhone 14', time: '2 mins ago', icon: <Smartphone size={18} color={Colors.secondary} />, color: Colors.secondary },
    { id: '2', title: 'Document Shared', desc: 'Aadhar Card generated link', time: '1 hour ago', icon: <Shield size={18} color={Colors.primary} />, color: Colors.primary },
    { id: '3', title: 'Primary IP Match', desc: 'Verified location: Delhi, IN', time: '3 hours ago', icon: <Globe size={18} color={Colors.accent} />, color: Colors.accent },
  ];

  const renderItem = ({ item }) => (
    <View style={[styles.logCard, Shadows.soft, { backgroundColor: Colors.card }]}>
      <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>{item.icon}</View>
      <View style={styles.content}>
        <Text style={[styles.logTitle, { color: Colors.text }]}>{item.title}</Text>
        <Text style={[styles.logDesc, { color: Colors.textLight }]}>{item.desc}</Text>
      </View>
      <Text style={[styles.logTime, { color: Colors.textLight }]}>{item.time}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Security Activity</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={[styles.listHeader, { color: Colors.textLight }]}>Recent security events across your devices.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  list: { padding: Spacing.lg },
  listHeader: { fontSize: 13, marginBottom: Spacing.xl, textAlign: 'center' },
  logCard: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  content: { flex: 1 },
  logTitle: { fontSize: 15, fontWeight: 'bold' },
  logDesc: { fontSize: 12, marginTop: 2 },
  logTime: { fontSize: 10 },
});

export default ActivityLogsScreen;
