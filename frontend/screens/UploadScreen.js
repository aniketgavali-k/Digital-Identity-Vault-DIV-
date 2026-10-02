import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Upload, File, X, Check, ArrowLeft, Shield } from 'lucide-react-native';
import { LightTheme, DarkTheme, Spacing, BorderRadius, Shadows } from '../constants/DesignTokens';

const UploadScreen = ({ navigation }) => {
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { isDark } = useTheme();
  const Colors = isDark ? DarkTheme : LightTheme;

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (!result.canceled) setFile(result.assets[0]);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!documentType || !file) {
      Alert.alert('Error', 'Please provide document type and select a file');
      return;
    }
    const formData = new FormData();
    formData.append('documentType', documentType);
    
    // Ensure URI is correctly formatted for React Native FormData
    const uri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
    
    formData.append('file', { 
      uri: uri, 
      name: file.name || 'document.pdf', 
      type: file.mimeType || 'application/octet-stream' 
    });

    try {
      setUploading(true);
      console.log('Uploading to:', '/documents/upload');
      const response = await api.post('/documents/upload', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      console.log('Upload success:', response.data);
      
      const isAutoVerified = response.data.autoVerified;
      const successTitle = isAutoVerified ? 'Verification Succeeded!' : 'Upload Successful';
      const successMsg = isAutoVerified 
        ? 'Your document has been automatically verified. You can now share it securely.' 
        : 'Document uploaded securely and is now in queue for verification.';

      Alert.alert(successTitle, successMsg, [
        { text: 'View Documents', onPress: () => navigation.navigate('Documents') }
      ]);
    } catch (error) {
      console.error('Upload Error Details:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Something went wrong';
      Alert.alert('Upload Failed', errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={[styles.header, { backgroundColor: Colors.card, borderBottomColor: Colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.text }]}>Secure Upload</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.1)' : '#EEF2FF' }]}>
          <Shield size={20} color={Colors.primary} />
          <Text style={[styles.infoText, { color: isDark ? Colors.primaryLight : '#4338CA' }]}>Your documents are securely protected in the vault.</Text>
        </View>

        <Text style={[styles.label, { color: Colors.text }]}>Document Category</Text>
        <View style={[styles.inputBox, Shadows.soft, { backgroundColor: Colors.card }]}>
          <TextInput
            style={[styles.input, { color: Colors.text }]}
            placeholder="e.g. Aadhar Card"
            value={documentType}
            onChangeText={setDocumentType}
            placeholderTextColor={Colors.textLight}
          />
        </View>

        <Text style={[styles.label, { color: Colors.text }]}>Select File</Text>
        <TouchableOpacity 
          style={[styles.uploadArea, file && styles.uploadAreaActive, Shadows.soft, { backgroundColor: Colors.card, borderColor: Colors.border }]} 
          onPress={pickDocument}
        >
          {file ? (
            <View style={styles.fileSelected}>
              <View style={[styles.fileIcon, { backgroundColor: `${Colors.secondary}30` }]}>
                <Check size={24} color={Colors.secondary} />
              </View>
              <Text style={[styles.fileName, { color: Colors.text }]} numberOfLines={1}>{file.name}</Text>
              <Text style={[styles.fileSize, { color: Colors.textLight }]}>{(file.size / 1024).toFixed(1)} KB</Text>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <LinearGradient colors={isDark ? ['#1E293B', '#334155'] : ['#F1F5F9', '#E2E8F0']} style={styles.iconCircle}>
                <Upload size={30} color={Colors.primary} />
              </LinearGradient>
              <Text style={[styles.placeholderText, { color: Colors.text }]}>Tap to browse</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, (uploading || !file) && styles.btnDisabled]} onPress={handleUpload} disabled={uploading || !file}>
          <LinearGradient colors={uploading || !file ? ['#CBD5E1', '#94A3B8'] : Colors.gradient} style={styles.btnGradient}>
            {uploading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#FFF" style={{ marginRight: 10 }} />
                <Text style={styles.btnText}>Verifying...</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>Securely Upload</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
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
  infoBox: { flexDirection: 'row', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.xl, alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 12, fontSize: 13, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: Spacing.sm, marginTop: Spacing.md },
  inputBox: { paddingHorizontal: 16, height: 56, borderRadius: BorderRadius.md, justifyContent: 'center' },
  input: { fontSize: 16 },
  uploadArea: { height: 180, borderRadius: BorderRadius.lg, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.sm },
  uploadAreaActive: { borderStyle: 'solid' },
  placeholder: { alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  placeholderText: { fontSize: 16, fontWeight: 'bold' },
  fileSelected: { alignItems: 'center', width: '100%', padding: 20 },
  fileIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  fileName: { fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  fileSize: { fontSize: 12, marginTop: 4 },
  btn: { marginTop: 40, borderRadius: BorderRadius.md, overflow: 'hidden', height: 56 },
  btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  btnDisabled: { opacity: 0.7 },
});

export default UploadScreen;
