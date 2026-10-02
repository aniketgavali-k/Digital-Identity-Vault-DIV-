import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { FileText, Check, X, Shield, ArrowLeft, User } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const VerifierScreen = ({ navigation }) => {
  const [pendingDocs, setPendingDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/documents/pending');
      setPendingDocs(data);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
      Alert.alert('Error', 'Could not fetch pending documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/documents/update/${id}`, { verificationStatus: status });
      Alert.alert('Success', `Document ${status} successfully`);
      fetchPending(); // Refresh list
    } catch (error) {
      console.error('Error updating document:', error);
      Alert.alert('Error', 'Failed to update document status');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, Shadows.soft, { backgroundColor: Colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
          <FileText size={24} color={Colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.docType, { color: Colors.text }]}>{item.documentType}</Text>
          <View style={styles.userInfo}>
            <User size={12} color={Colors.textLight} />
            <Text style={[styles.userName, { color: Colors.textLight }]}>{item.User?.name || 'Unknown'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: `${Colors.danger}20` }]} 
          onPress={() => handleVerify(item.id, 'rejected')}
        >
          <X size={20} color={Colors.danger} />
          <Text style={[styles.actionText, { color: Colors.danger }]}>Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: `${Colors.secondary}20` }]} 
          onPress={() => handleVerify(item.id, 'verified')}
        >
          <Check size={20} color={Colors.secondary} />
          <Text style={[styles.actionText, { color: Colors.secondary }]}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Verifier Portal</Text>
        <Shield size={20} color={Colors.primary} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={pendingDocs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPending(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Check size={48} color={Colors.secondary} />
              <Text style={[styles.emptyText, { color: Colors.textLight }]}>All documents are verified!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: Spacing.md, 
    borderBottomWidth: 1 
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  list: { padding: Spacing.lg },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  iconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: BorderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  headerInfo: { flex: 1 },
  docType: { fontSize: 16, fontWeight: 'bold' },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  userName: { fontSize: 13, marginLeft: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { 
    flex: 0.48, 
    height: 44, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  actionText: { fontWeight: 'bold', marginLeft: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 14 },
});

export default VerifierScreen;
