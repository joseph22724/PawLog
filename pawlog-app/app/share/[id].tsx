import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Checklist {
  medical: boolean;
  diet: boolean;
  allergies: boolean;
  meds: boolean;
  notes: boolean;
  documents: boolean;
}

interface PetData {
  name: string;
  species?: string;
  breed?: string;
  weight?: string;
  icon?: string;
  diet?: string;
  allergies?: string;
  medications?: string;
  sitterNotes?: string;
  [key: string]: any;
}

interface MedicalRecord {
  id: string;
  type?: string;
  fileUrl?: string;
  uploadedAt?: any;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SharedPetProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [petData, setPetData] = useState<PetData | null>(null);
  const [permissions, setPermissions] = useState<Checklist | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    if (!id) {
      setError('Invalid link.');
      setLoading(false);
      return;
    }

    const fetchSharedProfile = async () => {
      try {
        // ── Step A: Fetch the shared link envelope ──────────────────────────
        const linkSnap = await getDoc(doc(db, 'shared_links', id));
        if (!linkSnap.exists()) {
          setError('Link not found.');
          setLoading(false);
          return;
        }

        const linkData = linkSnap.data();

        // ── Step B: Check expiration ────────────────────────────────────────
        const expiresAt: number = linkData.expiresAt;
        if (new Date().getTime() > expiresAt) {
          setError('This shared link has expired.');
          setLoading(false);
          return;
        }

        // ── Step C: Fetch the pet document ──────────────────────────────────
        const { petId, checklist } = linkData as { petId: string; checklist: Checklist };
        setPermissions(checklist);

        const petSnap = await getDoc(doc(db, 'pets', petId));
        if (!petSnap.exists()) {
          setError('Pet profile not found.');
          setLoading(false);
          return;
        }

        setPetData({ id: petSnap.id, ...petSnap.data() } as unknown as PetData);

        // ── Step D: Fetch medical records if permitted ──────────────────────
        if (checklist.documents) {
          const recordsQuery = query(
            collection(db, 'pets', petId, 'medicalRecords'),
            orderBy('uploadedAt', 'desc')
          );
          const recordsSnap = await getDocs(recordsQuery);
          const records: MedicalRecord[] = recordsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setMedicalRecords(records);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching shared profile:', err);
        setError('Something went wrong. Please try again later.');
        setLoading(false);
      }
    };

    fetchSharedProfile();
  }, [id]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#F79E44" />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>🐾</Text>
        <Text style={styles.errorTitle}>{error}</Text>
        <Text style={styles.errorSub}>Please ask the pet owner for a new link.</Text>
      </View>
    );
  }

  // ── Render profile ──────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contentContainer}
    >
      {/* ── Powered-by banner ── */}
      <TouchableOpacity
        style={styles.banner}
        activeOpacity={0.75}
        onPress={() => Linking.openURL('https://vetpal.app')}
      >
        <Text style={styles.bannerText}>🐾 Shared via VetPal ↗</Text>
      </TouchableOpacity>

      {/* ── Pet identity card ── */}
      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{petData?.icon || '🐾'}</Text>
        </View>
        <Text style={styles.petName}>{petData?.name}</Text>
        <Text style={styles.petMeta}>
          {[petData?.species, petData?.breed, petData?.weight]
            .filter(Boolean)
            .join('  ·  ')}
        </Text>
      </View>

      {/* ── Conditionally rendered sections ── */}

      {permissions?.diet && petData?.diet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽 Diet &amp; Feeding</Text>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{petData.diet}</Text>
          </View>
        </View>
      )}

      {permissions?.allergies && petData?.allergies && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Allergies</Text>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{petData.allergies}</Text>
          </View>
        </View>
      )}

      {permissions?.meds && petData?.medications && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Medications</Text>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{petData.medications}</Text>
          </View>
        </View>
      )}

      {permissions?.notes && petData?.sitterNotes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Sitter Notes</Text>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{petData.sitterNotes}</Text>
          </View>
        </View>
      )}

      {permissions?.documents && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Medical Documents</Text>
          {medicalRecords.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No documents uploaded yet.</Text>
            </View>
          ) : (
            medicalRecords.map((record) => (
              <View key={record.id} style={[styles.card, styles.docCard]}>
                <View style={styles.docMeta}>
                  <Text style={styles.docName}>{record.type || 'Medical Document'}</Text>
                  {record.uploadedAt && (
                    <Text style={styles.docDate}>
                      {record.uploadedAt.toDate?.().toLocaleDateString() ?? ''}
                    </Text>
                  )}
                </View>
                {record.fileUrl && (
                  <Image
                    source={{ uri: record.fileUrl }}
                    style={styles.docThumbnail}
                    resizeMode="cover"
                  />
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* Bottom spacer */}
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FDFBF9',
  },
  contentContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Loading / error
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDFBF9',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#888',
  },
  errorIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2926',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSub: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Banner
  banner: {
    backgroundColor: '#FFF2E5',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F79E44',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F79E44',
    letterSpacing: 0.2,
  },

  // Identity card
  identityCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FDFBF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0EBE6',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  petName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2926',
    marginBottom: 6,
  },
  petMeta: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D2926',
    marginBottom: 10,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardValue: {
    fontSize: 16,
    color: '#2D2926',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic',
  },

  // Document card
  docCard: {
    marginBottom: 12,
  },
  docMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  docName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2926',
  },
  docDate: {
    fontSize: 13,
    color: '#888',
  },
  docThumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: '#F0EBE6',
  },
});
