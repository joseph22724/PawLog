import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';

export default function Index() {
  const router = useRouter();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const petsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPets(petsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pets: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, Sarah</Text>
          <Text style={styles.title}>PawPrint Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => alert('Profile Clicked!')}>
          <Text style={styles.profileBtnText}>S</Text>
        </TouchableOpacity>
      </View>

      {/* Body Section */}
      <ScrollView style={styles.body}>
        <Text style={styles.sectionTitle}>Your Pets</Text>
        
        {/* DYNAMIC RENDERING FROM FIRESTORE */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 20 }} />
        ) : pets.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#A09C98' }}>No pets found. Add one below!</Text>
        ) : (
          pets.map((pet) => (
            <TouchableOpacity 
              key={pet.id} 
              style={styles.petCard} 
              onPress={() => router.push(`/pet/${pet.id}`)}
            >
              <View style={styles.petCardLeft}>
                <View style={styles.petAvatar}>
                  <Text style={styles.petAvatarText}>{pet.icon || '🐾'}</Text>
                </View>
                <View>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petDetails}>{pet.breed} | {pet.weight}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.dotsBtn} onPress={() => alert(`${pet.name} Options`)}>
                <Text style={styles.dotsText}>⋮</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* 4. FLOATING ACTION BUTTON */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/add-pet' as any)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// 3. STYLES (Added the card styles so they look beautiful)
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
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2926', 
  },
  profileBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#F0EBE6',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2926',
  },
  body: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2926',
    marginBottom: 15,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0EBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2, 
  },
  petCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FDFBF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#F0EBE6',
  },
  petAvatarText: {
    fontSize: 24,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2926',
  },
  petDetails: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  dotsBtn: {
    padding: 10, 
  },
  dotsText: {
    fontSize: 20,
    color: '#A09C98',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#FF6B6B', // An accent color, maybe pawlog uses something specific, I'll use a nice coral red!
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2, // slight visual alignment adjustment
  }
});