import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { StatusBar } from 'expo-status-bar';

export default function EditPetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [diet, setDiet] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [sitterNotes, setSitterNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      if (!id || typeof id !== 'string') return;
      try {
        const petDoc = await getDoc(doc(db, 'pets', id));
        if (petDoc.exists()) {
          const data = petDoc.data();
          setName(data.name || '');
          setSpecies(data.species || '');
          setBreed(data.breed || '');
          setWeight(data.weight || '');
          setDiet(data.diet || '');
          setAllergies(data.allergies || '');
          setMedications(data.medications || '');
          setSitterNotes(data.sitterNotes || '');
        } else {
          Alert.alert('Error', 'Pet not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching pet:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchPet();
  }, [id]);

  const handleSubmit = async () => {
    if (!name.trim() || !species.trim() || !breed.trim() || !weight.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!id || typeof id !== 'string') return;

    setIsSubmitting(true);

    try {
      const petRef = doc(db, 'pets', id);
      
      await updateDoc(petRef, {
        name,
        species,
        breed,
        weight,
        diet,
        allergies,
        medications,
        sitterNotes,
        icon: species.toLowerCase() === 'cat' ? '🐱' : '🐶',
      });
      
      Alert.alert('Success', 'Pet updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating pet:', error);
      Alert.alert('Error', `Failed to update pet: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Pet</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" onScrollBeginDrag={Keyboard.dismiss}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Spot"
            placeholderTextColor="#A09C98"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Species</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dog, Cat"
            placeholderTextColor="#A09C98"
            value={species}
            onChangeText={setSpecies}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Beagle"
            placeholderTextColor="#A09C98"
            value={breed}
            onChangeText={setBreed}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 30 lbs"
            placeholderTextColor="#A09C98"
            value={weight}
            onChangeText={setWeight}
            keyboardType="default"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Diet</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dry kibble, 2x daily"
            placeholderTextColor="#A09C98"
            value={diet}
            onChangeText={setDiet}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Allergies</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Chicken, pollen"
            placeholderTextColor="#A09C98"
            value={allergies}
            onChangeText={setAllergies}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medications</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Heartworm pill on 1st"
            placeholderTextColor="#A09C98"
            value={medications}
            onChangeText={setMedications}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sitter Notes</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="e.g. Loves belly rubs, afraid of thunder..."
            placeholderTextColor="#A09C98"
            value={sitterNotes}
            onChangeText={setSitterNotes}
            multiline={true}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#F0EBE6',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2926',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D2926', 
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },

  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2926',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    color: '#2D2926',
  },
  footer: {
    paddingTop: 20,
    backgroundColor: '#FDFBF9',
  },
  submitBtn: {
    backgroundColor: '#2D2926',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#A09C98',
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  }
});
