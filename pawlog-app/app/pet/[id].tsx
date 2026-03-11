import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { doc, onSnapshot, collection, addDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebaseConfig';

export default function PetProfile() {
  // Grabs the exact document ID passed from the Dashboard
  const { id } = useLocalSearchParams(); 
  const router = useRouter();

  const [petData, setPetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);

  const pickDocument = async () => {
    Alert.alert(
      'Upload Document',
      'Choose a method to upload the medical document',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
              return;
            }
            
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.7,
            });

            if (!result.canceled) {
              setSelectedImageUri(result.assets[0].uri);
            }
          }
        },
        {
          text: 'Photo Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.7,
            });

            if (!result.canceled) {
              setSelectedImageUri(result.assets[0].uri);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const uploadDocument = async () => {
    if (!selectedImageUri || !id || typeof id !== 'string') return;

    setIsUploading(true);

    try {
      // Convert image uri to Blob
      const response = await fetch(selectedImageUri);
      const blob = await response.blob();

      // Create storage reference
      const fileName = `doc_${Date.now()}.jpg`;
      const fileRef = ref(storage, `pets/${id}/medical_records/${fileName}`);

      // Upload file
      await uploadBytes(fileRef, blob);

      // Get securely hosted Download URL
      const downloadUrl = await getDownloadURL(fileRef);

      // Save record internally to Firestore Sub-collection
      await addDoc(collection(db, 'pets', id, 'medicalRecords'), {
        fileUrl: downloadUrl,
        uploadedAt: Timestamp.now(),
        type: 'Uncategorized'
      });

      Alert.alert('Success', 'Medical document saved successfully!');
      setSelectedImageUri(null);
    } catch (error: any) {
      console.error('Error uploading document:', error);
      Alert.alert('Upload Failed', error.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const docRef = doc(db, 'pets', id);
    const unsubscribePet = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPetData({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pet data: ", error);
      setLoading(false);
    });

    const recordsRef = collection(db, 'pets', id, 'medicalRecords');
    const q = query(recordsRef, orderBy('uploadedAt', 'desc'));
    const unsubscribeRecords = onSnapshot(q, (querySnapshot) => {
      const records: any[] = [];
      querySnapshot.forEach((docSnap) => {
        records.push({ id: docSnap.id, ...docSnap.data() });
      });
      setMedicalRecords(records);
    }, (error) => {
      console.error("Error fetching medical records: ", error);
    });

    return () => {
      unsubscribePet();
      unsubscribeRecords();
    };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  if (!petData) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#A09C98' }}>Pet not found.</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: '#007AFF', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{petData.name}&apos;s Profile</Text>
        {/* Invisible spacer to keep the title perfectly centered */}
        <View style={{ width: 60 }} /> 
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>{petData.icon || '🐾'}</Text>
          </View>
          <Text style={styles.petName}>{petData.name}</Text>
          <Text style={{ fontSize: 16, color: '#666', marginBottom: 12 }}>{petData.species} | {petData.breed} | {petData.weight}</Text>
          <Text style={styles.statusBadge}>Status: Healthy</Text>
        </View>

        {/* Action Button: AI Vet Assistant */}
        <TouchableOpacity style={styles.aiBtn} onPress={() => alert('Opening AI Assistant...')}>
          <Text style={styles.aiBtnText}>✨ Ask AI Vet Assistant</Text>
        </TouchableOpacity>

        {/* Medical Scanner UI */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.scanBtn} onPress={pickDocument}>
            <Text style={styles.scanBtnText}>📷 Scan/Upload Medical Document</Text>
          </TouchableOpacity>

          {selectedImageUri && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Document Preview:</Text>
              <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
              <View style={styles.previewActions}>
                <TouchableOpacity 
                  style={[styles.saveBtn, isUploading && { opacity: 0.5 }]} 
                  onPress={uploadDocument}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>💾 Save Document</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.clearBtn} 
                  onPress={() => !isUploading && setSelectedImageUri(null)}
                  disabled={isUploading}
                >
                  <Text style={styles.clearBtnText}>Cancel/Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Medical Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Documents</Text>
          {medicalRecords.length === 0 ? (
            <Text style={{ color: '#888', fontStyle: 'italic', paddingHorizontal: 4 }}>No documents uploaded yet.</Text>
          ) : (
            medicalRecords.map((record) => (
              <View key={record.id} style={styles.card}>
                <View style={styles.recordRow}>
                  <Text style={styles.recordName}>{record.type || 'Medical Document'}</Text>
                  <Text style={styles.recordDate}>
                    {record.uploadedAt ? record.uploadedAt.toDate().toLocaleDateString() : ''}
                  </Text>
                </View>
                {record.fileUrl && (
                  <Image 
                    source={{ uri: record.fileUrl }} 
                    style={styles.thumbnailImage} 
                  />
                )}
              </View>
            ))
          )}
        </View>

        {/* Bottom spacer so you can scroll past the last card comfortably */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 10,
    marginLeft: -10,
  },
  backBtnText: {
    fontSize: 16,
    color: '#007AFF', 
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2926',
  },
  body: {
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarEmoji: {
    fontSize: 45,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2926',
    marginBottom: 6,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9', // Soft green
    color: '#2E7D32', // Dark green text
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
  },
  aiBtn: {
    backgroundColor: '#2D2926',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aiBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2926',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2926',
  },
  recordStatus: {
    fontSize: 12,
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recordStatusAction: {
    fontSize: 12,
    color: '#C62828', // Red for alert
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recordDate: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginTop: 12,
    resizeMode: 'cover',
    backgroundColor: '#F0EBE6',
  },
  scanBtn: {
    backgroundColor: '#F0EBE6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0DBD6',
  },
  scanBtnText: {
    color: '#2D2926',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D2926',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#2D2926',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#C62828',
    fontWeight: '600',
  }
});