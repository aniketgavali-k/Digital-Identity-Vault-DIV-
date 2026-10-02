import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Clipboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import api, { BASE_URL } from '../services/api';
import { Share2, Clock, Copy, ArrowLeft, ShieldCheck, Check } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const ShareScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [sharing, setSharing] = useState(false);
  const [expiryDays, setExpiryDays] = useState(1);
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/documents/my-documents');
      setDocuments(data.filter(d => d.verificationStatus === 'verified'));
    } catch (error) { console.error('Error fetching docs:', error); }
    finally { setLoading(false); }
  };

  const handleShare = async () => {
    if (!selectedDoc) return;
    try {
      setSharing(true);
      const { data } = await api.post('/share/create', { 
        documentId: selectedDoc.id, 
        expiryDays: expiryDays 
      });
      // Using shorthand link format and correct IP
      setShareLink(`${BASE_URL}/s/${data.accessToken}`);
    } catch (error) { 
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to generate share link'); 
    }
    finally { setSharing(false); }
  };

  const copyToClipboard = () => {
    Clipboard.setString(shareLink);
    Alert.alert('Copied', 'Share link copied to clipboard!');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Safe Sharing</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.introBox, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]}>
          <ShieldCheck size={24} color={Colors.secondary} />
          <Text style={[styles.introText, { color: isDark ? Colors.secondaryLight : '#166534' }]}>Generate time-limited access tokens for verified documents.</Text>
        </View>

        <Text style={[styles.label, { color: Colors.text }]}>Select Document</Text>
        {loading ? <ActivityIndicator color={Colors.primary} /> : documents.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: Colors.card }]}><Text style={[styles.emptyText, { color: Colors.textLight }]}>No verified documents available.</Text></View>
        ) : (
          <View style={styles.docList}>
            {documents.map(doc => (
              <TouchableOpacity key={doc.id} style={[styles.docCard, Shadows.soft, { backgroundColor: Colors.card }, selectedDoc?.id === doc.id && { borderColor: Colors.secondary, backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4' }]} onPress={() => { setSelectedDoc(doc); setShareLink(''); }}>
                <View style={styles.docInfo}><Text style={[styles.docTitle, { color: Colors.text }]}>{doc.documentType}</Text><Text style={[styles.docDate, { color: Colors.textLight }]}>Verified on {new Date(doc.uploadDate).toLocaleDateString()}</Text></View>
                {selectedDoc?.id === doc.id && <Check size={20} color={Colors.secondary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedDoc && !shareLink && (
          <View style={styles.expiryContainer}>
            <Text style={[styles.label, { color: Colors.text }]}>Link Validity</Text>
            <View style={styles.expiryOptions}>
              {[
                { label: '24 Hours', value: 1 },
                { label: '7 Days', value: 7 },
                { label: '15 Days', value: 15 }
              ].map((opt) => (
                <TouchableOpacity 
                  key={opt.value} 
                  style={[
                    styles.expiryBtn, 
                    { backgroundColor: Colors.card, borderColor: Colors.border },
                    expiryDays === opt.value && { borderColor: Colors.primary, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF' }
                  ]}
                  onPress={() => setExpiryDays(opt.value)}
                >
                  <Text style={[
                    styles.expiryBtnText, 
                    { color: Colors.text },
                    expiryDays === opt.value && { color: Colors.primary, fontWeight: 'bold' }
                  ]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedDoc && !shareLink && (
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <LinearGradient colors={Colors.gradientAmber} style={styles.shareGradient}>{sharing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.shareText}>Generate Secure Link</Text>}</LinearGradient>
          </TouchableOpacity>
        )}

        {shareLink && (
          <View style={[styles.resultCard, Shadows.medium, { backgroundColor: Colors.card }]}>
            <Text style={[styles.resultLabel, { color: Colors.textLight }]}>Public Share Link</Text>
            <View style={[styles.linkBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
              <Text style={[styles.linkText, { color: Colors.primaryLight }]} numberOfLines={1}>{shareLink}</Text>
              <TouchableOpacity onPress={copyToClipboard} style={styles.copyBtn}><Copy size={18} color={Colors.primary} /></TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: Spacing.lg },
  introBox: { padding: Spacing.md, borderRadius: BorderRadius.md, flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  introText: { flex: 1, marginLeft: 12, fontSize: 13 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: Spacing.md },
  docList: { marginBottom: Spacing.xl },
  docCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: 'transparent' },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 15, fontWeight: 'bold' },
  docDate: { fontSize: 11, marginTop: 2 },
  shareBtn: { height: 56, borderRadius: BorderRadius.md, overflow: 'hidden', marginTop: Spacing.md },
  shareGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  shareText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  resultCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, marginTop: Spacing.xl },
  resultLabel: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: Spacing.md },
  linkBox: { flexDirection: 'row', padding: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  linkText: { flex: 1, fontSize: 14, fontWeight: '600' },
  copyBtn: { padding: 4 },
  emptyBox: { padding: Spacing.xl, borderRadius: BorderRadius.md, alignItems: 'center' },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 22 },
  expiryContainer: { marginTop: Spacing.md, marginBottom: Spacing.lg },
  expiryOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  expiryBtn: { flex: 0.31, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1, alignItems: 'center' },
  expiryBtnText: { fontSize: 12 },
});

export default ShareScreen;
