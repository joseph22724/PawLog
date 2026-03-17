import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground 
      // Using a beautiful dog/cat placeholder image for the aesthetic
      source={{ uri: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1000&auto=format&fit=crop' }} 
      style={styles.background}
    >
      <StatusBar style="light" />
      {/* Dark overlay to make text and buttons pop */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.container}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>PawLog</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]} 
            onPress={() => router.push('/(auth)/register' as any)}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={() => router.push('/(auth)/login' as any)}
          >
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  brandContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -1,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28, // Fully pill-shaped
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButton: {
    backgroundColor: '#F79E44', // Specified Orange
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#333333', // Dark text on white background
    fontSize: 18,
    fontWeight: '700',
  },
});
