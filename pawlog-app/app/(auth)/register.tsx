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
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  
  // Step Management
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [marketingChecked, setMarketingChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  // Step 2 State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Validations
  const hasCapital = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@#$%&]/.test(password);
  const isLongEnough = password.length > 8;

  const handleNextStep = () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Missing Info', 'Please fill out all fields.');
      return;
    }
    if (!termsChecked) {
      Alert.alert('Terms Required', 'You must agree to the Terms & Conditions to proceed.');
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Your passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Save user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        marketingOptIn: marketingChecked,
        createdAt: new Date().toISOString(),
      });

      // Navigate to dashboard
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'We could not create your account.');
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
          <TouchableOpacity onPress={() => step === 2 ? setStep(1) : router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>P</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 1 ? (
            <View style={styles.stepContainer}>
              <Text style={styles.mainTitle}>Register</Text>
              <Text style={styles.subtitle}>Your PawLog Journey starts now.</Text>

              <Text style={styles.inputLabel}>What should we call you?</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#888"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#888"
                value={lastName}
                onChangeText={setLastName}
              />

              <Text style={styles.inputLabel}>What&apos;s your email?</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, marketingChecked && styles.checkboxActive]}
                  onPress={() => setMarketingChecked(!marketingChecked)}
                >
                  {marketingChecked && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>Sign up for exclusive offers, product launches and more!</Text>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, termsChecked && styles.checkboxActive]}
                  onPress={() => setTermsChecked(!termsChecked)}
                >
                  {termsChecked && <Ionicons name="checkmark" size={16} color="#FFF" />}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>
                  By checking this box. I agree to PawLog&apos;s <Text style={styles.orangeText}>Terms&Conditions</Text>. *
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.continueButton, firstName && lastName && email && termsChecked ? styles.activeButton : null]} 
                onPress={handleNextStep}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.stepContainer}>
              <Text style={styles.mainTitle}>Create Password</Text>

              <Text style={styles.inputLabel}>Create Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter Password"
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#888" />
                </TouchableOpacity>
              </View>

              <View style={styles.validationRules}>
                <Text style={styles.validationHeader}>For a strong password make sure your password contains:</Text>
                <Text style={[styles.validationRule, hasCapital && styles.validRule]}>
                  • A capital letter,
                </Text>
                <Text style={[styles.validationRule, isLongEnough && styles.validRule]}>
                  • Is longer than 8 characters
                </Text>
                <Text style={[styles.validationRule, hasNumber && styles.validRule]}>
                  • Contains a number
                </Text>
                <Text style={[styles.validationRule, hasSpecial && styles.validRule]}>
                  • Contains a special symbol (@#$%&)
                </Text>
              </View>

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter Password"
                  placeholderTextColor="#888"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#888" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.continueButton, password && confirmPassword ? styles.activeButton : null]} 
                onPress={handleRegister}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.continueButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#F79E44',
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
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
  stepContainer: {
    width: '100%',
  },
  mainTitle: {
    fontSize: 34,
    color: '#333333',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A4A4A',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 15,
    color: '#4A4A4A',
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
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
    borderRadius: 28,
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
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingRight: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#888',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#F79E44',
    borderColor: '#F79E44',
  },
  checkboxText: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
    flexShrink: 1,
  },
  orangeText: {
    color: '#F79E44',
  },
  validationRules: {
    marginBottom: 10,
  },
  validationHeader: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
    lineHeight: 20,
  },
  validationRule: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  validRule: {
    color: '#F79E44',
  },
  continueButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#B0B0B0', // Grey styling
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  activeButton: {
    backgroundColor: '#F79E44',
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
