import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Success! Route to main dashboard
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'We could not log you in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.logoBadge}>
            {/* Branding override based on user instructions */}
            <Text style={styles.logoBadgeText}>P</Text> 
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome to a</Text>
          <Text style={styles.titleStrong}>better life with pets</Text>
          
          <View style={styles.registerPrompt}>
            <Text style={styles.registerText}>Need an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.registerLink}>Register ➔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter Password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={22} 
                  color="#888" 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.forgotContainer}>
              <Text style={styles.forgotText}>Forgot password? </Text>
              <TouchableOpacity onPress={() => alert('Password Reset coming soon!')}>
                <Text style={styles.resetLink}>Reset</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.loginButton, email && password ? styles.activeButton : null]} 
              onPress={handleLogin}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Clean white/off-white background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    justifyContent: 'center',
    height: 60,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  logoBadge: {
    backgroundColor: '#F79E44', // Orange branding
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadgeText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#4A4A4A',
    fontWeight: '600',
    textAlign: 'center',
  },
  titleStrong: {
    fontSize: 34,
    color: '#333333',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  registerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  registerText: {
    fontSize: 16,
    color: '#888',
  },
  registerLink: {
    fontSize: 16,
    color: '#F79E44', // Orange branding
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28, // Fully pill-shaped
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28, // Fully pill-shaped
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 15,
  },
  forgotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  forgotText: {
    fontSize: 14,
    color: '#888',
  },
  resetLink: {
    fontSize: 14,
    color: '#F79E44', // Orange branding
    fontWeight: '600',
  },
  loginButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#B0B0B0', // User instructed Grey
    borderRadius: 28, // Fully pill-shaped
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#F79E44',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
