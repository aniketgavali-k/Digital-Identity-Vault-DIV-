import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../services/api';
import { FileText, Clock, CheckCircle, XCircle, ChevronRight, Filter, Search, X } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const DocumentsScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter(doc => 
        doc.documentType.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDocuments(filtered);
    }
  }, [searchQuery, documents]);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/documents/my-documents');
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'verified': return { color: Colors.secondary, bg: `${Colors.secondary}15`, icon: <CheckCircle size={14} color={Colors.secondary} /> };
      case 'rejected': return { color: Colors.danger, bg: `${Colors.danger}15`, icon: <XCircle size={14} color={Colors.danger} /> };
      default: return { color: Colors.accent, bg: `${Colors.accent}15`, icon: <Clock size={14} color={Colors.accent} /> };
    }
  };

  const renderSkeleton = () => (
    <View style={[styles.card, { backgroundColor: Colors.card }]}>
      <SkeletonLoader width={50} height={50} borderRadius={12} style={{ marginRight: 16 }} />
      <View style={{ flex: 1 }}>
        <SkeletonLoader width="60%" height={20} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="40%" height={14} />
      </View>
    </View>
  );

  const renderItem = ({ item }) => {
    const status = getStatusStyle(item.verificationStatus);
    
    return (
      <TouchableOpacity 
        style={[styles.card, Shadows.soft, { backgroundColor: Colors.card }]}
        onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
      >
        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
          <FileText size={24} color={Colors.primary} />
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.docType, { color: Colors.text }]}>{item.documentType}</Text>
          <Text style={[styles.date, { color: Colors.textLight }]}>{new Date(item.uploadDate).toLocaleDateString()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            {status.icon}
            <Text style={[styles.statusText, { color: status.color }]}>
              {item.verificationStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <ChevronRight size={20} color={isDark ? Colors.border : '#CBD5E1'} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <LinearGradient colors={Colors.gradient} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>My Vault</Text>
            <Text style={styles.headerSubtitle}>{documents.length} Secure Documents</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Filter size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchContainer, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
          <Search size={18} color="#FFF" style={{ opacity: 0.8 }} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search records..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.list}>
          {renderSkeleton()}
          {renderSkeleton()}
          {renderSkeleton()}
        </View>
      ) : (
        <FlatList
          data={filteredDocuments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} tintColor={Colors.primary} onRefresh={() => { setRefreshing(true); fetchDocuments(); }} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FileText size={48} color={isDark ? '#334155' : '#E2E8F0'} />
              <Text style={[styles.emptyText, { color: Colors.textLight }]}>No documents in your vault yet.</Text>
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
    padding: Spacing.xl, 
    paddingTop: 50,
    borderBottomLeftRadius: BorderRadius.xl, 
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, marginTop: 2 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  searchInput: { flex: 1, marginLeft: 10, color: '#FFF', fontSize: 15 },
  list: { padding: Spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: { flex: 1 },
  docType: { fontSize: 16, fontWeight: 'bold' },
  date: { fontSize: 12, marginTop: 2, marginBottom: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 14 },
});

export default DocumentsScreen;
