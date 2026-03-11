import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { StatusBar } from 'expo-status-bar';

export default function AddPetScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !species.trim() || !breed.trim() || !weight.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const now = Timestamp.now();
      
      const petData = {
        name,
        species,
        breed,
        weight,
        icon: species.toLowerCase() === 'cat' ? '🐱' : '🐶', // Default basic logic
        ownerId: 'default-owner', // Temporary hardcoded user id
        medicalSummary: '',
        birthDate: now,
        createdAt: now,
      };

      console.log('Attempting to add pet to Firestore:', petData.name);
      const docRef = await addDoc(collection(db, 'pets'), petData);
      console.log('Successfully added with ID:', docRef.id);
      
      Alert.alert('Success', 'Pet added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error adding pet:', error);
      Alert.alert('Error', `Failed to add pet: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add New Pet</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
        
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

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Submit</Text>
          )}
        </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 20,
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
    padding: 20,
    backgroundColor: '#FDFBF9',
    borderTopWidth: 1,
    borderTopColor: '#F0EBE6',
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
