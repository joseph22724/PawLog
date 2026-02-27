import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// 1. THIS IS OUR "MOCK DATABASE". 
// Later, Firebase will provide this exact structure automatically.
const mockDatabase = [
  { id: '1', name: 'Spot', breed: 'Beagle', age: '4 Years', weight: '30 lbs', icon: '🐶' },
  { id: '2', name: 'Luna', breed: 'Tabby', age: '2 Years', weight: '10 lbs', icon: '🐱' },
  { id: '3', name: 'Barnaby', breed: 'Golden Retriever', age: '1 Year', weight: '65 lbs', icon: '🐕' }
];

export default function Index() {
  const router = useRouter();

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
        
        {/* 2. DYNAMIC RENDERING */}
        {/* We map through the array and automatically generate a card for every pet */}
        {mockDatabase.map((pet) => (
          <TouchableOpacity 
            key={pet.id} 
            style={styles.petCard} 
            // We pass the pet's name to the dynamic route!
            onPress={() => router.push(`/pet/${pet.name}`)}
          >
            <View style={styles.petCardLeft}>
              <View style={styles.petAvatar}>
                <Text style={styles.petAvatarText}>{pet.icon}</Text>
              </View>
              <View>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petDetails}>{pet.breed} | {pet.age} | {pet.weight}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.dotsBtn} onPress={() => alert(`${pet.name} Options`)}>
              <Text style={styles.dotsText}>⋮</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

      </ScrollView>
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
  }
});