import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import api, { BASE_URL } from '../services/api';
import { ArrowLeft, FileText, Calendar, ShieldCheck, Download, Trash2, Share2 } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';

const DocumentDetailScreen = ({ route, navigation }) => {
  const { documentId } = route.params;
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const { data } = await api.get(`/documents/my-documents`);
      const doc = data.find(d => d.id === documentId);
      if (doc) setDocument(doc);
      else throw new Error('Document not found');
    } catch (error) {
      Alert.alert('Error', 'Failed to load document details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to permanently remove this document from your vault?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await api.delete(`/documents/delete/${documentId}`);
              Alert.alert('Deleted', 'Document removed successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          }
        }
      ]
    );
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      const token = await SecureStore.getItemAsync('token');
      const originalName = document?.fileUrl?.split('-').slice(1).join('-').replace('.enc', '') || 'document';
      const fileUri = `${FileSystem.documentDirectory}${originalName}`;

      const downloadRes = await FileSystem.downloadAsync(
        `${BASE_URL}/api/documents/download/${documentId}`,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (downloadRes.status !== 200) {
        throw new Error('Failed to download file');
      }

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(fileUri);
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download document');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Document Details</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Trash2 size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.iconCard, Shadows.soft, { backgroundColor: Colors.card }]}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#334155' : '#F8FAFC' }]}>
            <FileText size={48} color={Colors.primary} />
          </View>
          <Text style={[styles.docType, { color: Colors.text }]}>{document?.documentType}</Text>
          <View style={[styles.statusBadge, { backgroundColor: document?.verificationStatus === 'verified' ? `${Colors.secondary}15` : `${Colors.accent}15` }]}>
             <ShieldCheck size={14} color={document?.verificationStatus === 'verified' ? Colors.secondary : Colors.accent} />
             <Text style={[styles.statusText, { color: document?.verificationStatus === 'verified' ? Colors.secondary : Colors.accent }]}>
               {document?.verificationStatus?.toUpperCase() || 'PENDING'}
             </Text>
          </View>
        </View>

        <View style={[styles.infoCard, Shadows.soft, { backgroundColor: Colors.card }]}>
          <DetailItem icon={<Calendar size={18} color={Colors.textLight} />} label="Uploaded On" value={new Date(document?.uploadDate).toLocaleDateString()} />
          <View style={[styles.divider, { backgroundColor: Colors.border }]} />
          <DetailItem icon={<ShieldCheck size={18} color={Colors.textLight} />} label="Security" value="Highly Secure" />
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Download size={20} color="#FFF" />
                <Text style={styles.actionBtnText}>Download</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: Colors.secondary }]}
            onPress={() => navigation.navigate('Share')}
          >
            <Share2 size={20} color="#FFF" />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailItem = ({ icon, label, value }) => {
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;
  return (
    <View style={styles.detailItem}>
      {icon}
      <View style={styles.detailContent}>
        <Text style={[styles.detailLabel, { color: Colors.textLight }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: Colors.text }]}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  deleteBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: Spacing.lg },
  iconCard: { alignItems: 'center', padding: Spacing.xl, borderRadius: BorderRadius.lg, marginBottom: Spacing.xl },
  iconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  docType: { fontSize: 22, fontWeight: 'bold', marginBottom: Spacing.sm },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  infoCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.xl },
  detailItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  detailContent: { marginLeft: Spacing.md },
  detailLabel: { fontSize: 12, marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 0.48, height: 50, borderRadius: BorderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
});

export default DocumentDetailScreen;
