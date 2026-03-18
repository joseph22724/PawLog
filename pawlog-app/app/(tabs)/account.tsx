import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [firstName, setFirstName] = useState('');

  React.useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setFirstName(userDoc.data().firstName || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.replace('/(auth)/welcome' as any);
    } catch (error: any) {
      console.error('Logout error:', error);
      Alert.alert('Logout Failed', error.message || 'There was an issue logging out.');
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#A09C98" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{firstName || 'User'}</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>Settings</Text>
          
          <TouchableOpacity style={styles.settingsRow} onPress={() => alert('Notifications coming soon!')}>
            <Ionicons name="notifications-outline" size={24} color="#2D2926" style={styles.rowIcon} />
            <Text style={styles.rowText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#A09C98" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow} onPress={() => alert('Privacy coming soon!')}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#2D2926" style={styles.rowIcon} />
            <Text style={styles.rowText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#A09C98" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.versionText}>VetPal Version 1.0.0</Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2926',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 40,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0EBE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    color: '#A09C98',
    marginBottom: 4,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 18,
    color: '#2D2926',
    fontWeight: 'bold',
  },
  settingsSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2926',
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0EBE6',
    marginBottom: 12,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    color: '#2D2926',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30', // Apple standard destructive red
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 16,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#A09C98',
    fontSize: 12,
    marginBottom: 20,
  }
});
