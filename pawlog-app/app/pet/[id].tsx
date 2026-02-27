import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function PetProfile() {
  // Grabs the exact pet name passed from the Dashboard
  const { id } = useLocalSearchParams(); 
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{id}'s Profile</Text>
        {/* Invisible spacer to keep the title perfectly centered */}
        <View style={{ width: 60 }} /> 
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarEmoji}>{id === 'Luna' ? '🐱' : '🐶'}</Text>
          </View>
          <Text style={styles.petName}>{id}</Text>
          <Text style={styles.statusBadge}>Status: Healthy</Text>
        </View>

        {/* Action Button: AI Vet Assistant */}
        <TouchableOpacity style={styles.aiBtn} onPress={() => alert('Opening AI Assistant...')}>
          <Text style={styles.aiBtnText}>✨ Ask AI Vet Assistant</Text>
        </TouchableOpacity>

        {/* Medical Records Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vaccination Records</Text>
          <View style={styles.card}>
            <View style={styles.recordRow}>
              <Text style={styles.recordName}>Rabies (1-Year)</Text>
              <Text style={styles.recordStatus}>Up to date</Text>
            </View>
            <Text style={styles.recordDate}>Administered: Oct 12, 2025</Text>
            <Text style={styles.recordDate}>Due: Oct 12, 2026</Text>
          </View>
        </View>

        {/* Prescriptions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Prescriptions</Text>
          <View style={styles.card}>
            <View style={styles.recordRow}>
              <Text style={styles.recordName}>Heartgard Plus</Text>
              <Text style={styles.recordStatusAction}>Refill Needed</Text>
            </View>
            <Text style={styles.recordDate}>Dosage: 1 chewable monthly</Text>
            <Text style={styles.recordDate}>Prescribing Vet: Dr. Smith</Text>
          </View>
        </View>

        {/* Vet Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Vet Notes</Text>
          <View style={styles.card}>
            <Text style={styles.recordName}>Annual Checkup</Text>
            <Text style={styles.recordDate}>Feb 15, 2026</Text>
            <Text style={styles.noteText}>
              Weight is stable. Teeth look good, but recommend starting daily brushing to prevent tartar buildup. Heart and lungs sound perfectly normal.
            </Text>
          </View>
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
  }
});