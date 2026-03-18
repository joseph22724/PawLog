import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Share, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

export default function SharePetProfile() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isPremium] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [recipient, setRecipient] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({
    medical: false,
    diet: false,
    allergies: false,
    meds: false,
    notes: false,
    documents: false,
  });

  const handleRecipientSelect = (type: string) => {
    setRecipient(type);
    
    // Auto-toggle logic
    let newChecklist = { ...checklist };
    if (type === 'Veterinarian') {
      newChecklist = { medical: true, diet: true, allergies: true, meds: true, notes: true, documents: false };
    } else if (type === 'Pet Sitter') {
      newChecklist = { medical: false, diet: false, allergies: false, meds: false, notes: true, documents: false };
    } else if (type === 'Friend/Family') {
      newChecklist = { medical: false, diet: true, allergies: false, meds: false, notes: true, documents: false };
    } else if (type === 'Custom') {
      newChecklist = { medical: false, diet: false, allergies: false, meds: false, notes: false, documents: false };
    }
    
    setChecklist(newChecklist);
    setStep(2);
  };

  const handlePremiumToggle = (val: boolean) => {
    if (val && !isPremium) {
      Alert.alert(
        'VetPal Premium',
        'Upgrade to share full-resolution medical documents and vet bills directly via web link!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade Now', style: 'default' }
        ]
      );
      return;
    }
    setChecklist(prev => ({ ...prev, documents: val }));
  };

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      // Calculate Expiration Date
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expiresInDays);

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'shared_links'), {
        petId: id,
        checklist: checklist,
        expiresAt: expirationDate.getTime(),
        createdAt: serverTimestamp(),
      });

      // Construct and set real Share URL
      const generatedUrl = `https://vetpal.app/share/${docRef.id}`;
      setShareUrl(generatedUrl);
      setStep(3);

    } catch (error) {
      console.error('Error generating share link:', error);
      Alert.alert('Error', 'Could not generate link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my pet's profile on VetPal! ${shareUrl}`,
      });
    } catch (error: any) {
      console.error('Share error:', error.message);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Who are you sharing with?</Text>
      <Text style={styles.subtitle}>We&apos;ll automatically select the most relevant info.</Text>

      <TouchableOpacity style={styles.optionBtn} onPress={() => handleRecipientSelect('Veterinarian')}>
        <Text style={styles.optionIcon}>🩺</Text>
        <Text style={styles.optionText}>Veterinarian</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.optionBtn} onPress={() => handleRecipientSelect('Pet Sitter')}>
        <Text style={styles.optionIcon}>🏠</Text>
        <Text style={styles.optionText}>Pet Sitter</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.optionBtn} onPress={() => handleRecipientSelect('Friend/Family')}>
        <Text style={styles.optionIcon}>❤️</Text>
        <Text style={styles.optionText}>Friend/Family</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.optionBtn} onPress={() => handleRecipientSelect('Custom')}>
        <Text style={styles.optionIcon}>⚙️</Text>
        <Text style={styles.optionText}>Custom</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>What do you want to include?</Text>
      <Text style={styles.subtitle}>Toggle the specific details you want to share.</Text>

      <View style={styles.checklistContainer}>
        <View style={styles.checkRow}>
          <Text style={styles.checkText}>Medical Records</Text>
          <Switch 
            value={checklist.medical} 
            onValueChange={(val) => setChecklist(prev => ({ ...prev, medical: val }))}
            trackColor={{ false: '#E0DBD6', true: '#F79E44' }}
          />
        </View>
        <View style={styles.checkRow}>
          <Text style={styles.checkText}>Diet & Feeding</Text>
          <Switch 
            value={checklist.diet} 
            onValueChange={(val) => setChecklist(prev => ({ ...prev, diet: val }))}
            trackColor={{ false: '#E0DBD6', true: '#F79E44' }}
          />
        </View>
        <View style={styles.checkRow}>
          <Text style={styles.checkText}>Allergies</Text>
          <Switch 
            value={checklist.allergies} 
            onValueChange={(val) => setChecklist(prev => ({ ...prev, allergies: val }))}
            trackColor={{ false: '#E0DBD6', true: '#F79E44' }}
          />
        </View>
        <View style={styles.checkRow}>
          <Text style={styles.checkText}>Medications</Text>
          <Switch 
            value={checklist.meds} 
            onValueChange={(val) => setChecklist(prev => ({ ...prev, meds: val }))}
            trackColor={{ false: '#E0DBD6', true: '#F79E44' }}
          />
        </View>
        <View style={styles.checkRow}>
          <Text style={styles.checkText}>Sitter Notes</Text>
          <Switch 
            value={checklist.notes} 
            onValueChange={(val) => setChecklist(prev => ({ ...prev, notes: val }))}
            trackColor={{ false: '#E0DBD6', true: '#F79E44' }}
          />
        </View>
        <View style={styles.checkRow}>
          <Text style={styles.checkText}>Include Document Scans (Premium)</Text>
          <Switch 
            value={checklist.documents} 
            onValueChange={handlePremiumToggle}
            trackColor={{ false: '#E0DBD6', true: '#F79E44' }}
          />
        </View>
      </View>

      <Text style={[styles.title, { fontSize: 22, marginTop: 10, marginBottom: 15 }]}>Link Expires In:</Text>
      <View style={styles.expirationContainer}>
        {[1, 7, 30].map(days => (
          <TouchableOpacity 
            key={days}
            style={[
              styles.expireBtn, 
              expiresInDays === days && styles.expireBtnActive
            ]}
            onPress={() => setExpiresInDays(days)}
          >
            <Text style={[
              styles.expireBtnText,
              expiresInDays === days && styles.expireBtnTextActive
            ]}>
              {days} {days === 1 ? 'Day' : 'Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)} disabled={isGenerating}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.nextBtn, isGenerating && styles.nextBtnDisabled]} 
          onPress={generateShareLink}
          disabled={isGenerating}
        >
          <Text style={styles.nextBtnText}>
            {isGenerating ? 'Generating...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Ready to Share</Text>
      <Text style={styles.subtitle}>Have them scan this, or send a secure link directly.</Text>

      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        {shareUrl ? (
          <QRCode value={shareUrl} size={200} />
        ) : (
          <Text style={styles.qrText}>Generating QR...</Text>
        )}
      </View>

      <TouchableOpacity style={styles.primaryShareBtn} onPress={handleShare}>
        <Text style={styles.primaryShareBtnText}>Share via Text/Email</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
        <Text style={styles.doneBtnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => router.back()}>
          <Text style={styles.headerBackBtnText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
    backgroundColor: '#FFFFFF',
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#F0EBE6',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2926',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2926',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2926',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2926',
  },
  checklistContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    marginBottom: 30,
  },
  checkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FDFBF9',
  },
  checkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D2926',
  },
  expirationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 10,
  },
  expireBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0DBD6',
  },
  expireBtnActive: {
    backgroundColor: '#FFF2E5', // Light orange tint
    borderColor: '#F79E44',
    borderWidth: 2,
  },
  expireBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  expireBtnTextActive: {
    color: '#F79E44',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: '#F0EBE6',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D2926',
  },
  nextBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: '#F79E44',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextBtnDisabled: {
    opacity: 0.6,
  },
  qrPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F0EBE6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#E0DBD6',
    borderStyle: 'dashed',
  },
  qrText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  primaryShareBtn: {
    backgroundColor: '#F79E44',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryShareBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#A09C98',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
