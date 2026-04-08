import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';

export default function PetChat() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [medicalContext, setMedicalContext] = useState('');

  // Fetch the RAG Context (On Mount)
  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    const fetchContext = async () => {
      try {
        const docsRef = collection(db, 'pets', id, 'documents');
        const q = query(docsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);

        let fullContext = '';
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.rawText) {
            fullContext += `Document: ${data.title}\nDate: ${data.date}\n${data.rawText}\n\n`;
          }
        });
        setMedicalContext(fullContext);
      } catch (err) {
        console.error('Error fetching context:', err);
      }
    };

    fetchContext();
  }, [id]);

  // The Gemini 2.5 Flash-Lite API Call
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setIsLoading(true);


    try {
      const contents = newMessages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const payload = {
        system_instruction: {
          parts: [{
            text: "You are VetPal, a helpful veterinary AI assistant. Answer the user's questions using strictly the following medical records. If the answer is not in the records, say you don't know based on the provided documents.\n\nMedical Records:\n" + medicalContext
          }]
        },
        contents: contents
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText) {
        setMessages((prev) => [...prev, { role: 'model', text: aiText }]);
      } else {
        setMessages((prev) => [...prev, { role: 'model', text: "Sorry, I couldn't generate a response." }]);
        console.error('Gemini API Error Response:', data);
      }
    } catch (err) {
      console.error('Error during chat:', err);
      setMessages((prev) => [...prev, { role: 'model', text: "An error occurred connecting to VetPal." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: { role: string; text: string } }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.modelBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.modelText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat with VetPal</Text>
          <View style={{ width: 60 }} />
        </View>

        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about medical records..."
            placeholderTextColor="#888"
            multiline
            onSubmitEditing={sendMessage}
          />
          {isLoading ? (
            <ActivityIndicator style={[styles.sendBtn, { backgroundColor: 'transparent' }]} color="#FF6B6B" />
          ) : (
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F7' },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    backgroundColor: '#FAF9F7',
    borderBottomWidth: 1,
    borderBottomColor: '#EAE6E2',
  },
  backBtn: { width: 60 },
  backBtnText: { fontSize: 16, color: '#FF6B6B', fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2D2926' },
  listContent: { padding: 15, paddingBottom: 30 },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#F79E44',
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAE6E2',
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFF' },
  modelText: { color: '#2D2926' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EAE6E2',
  },
  input: {
    flex: 1,
    backgroundColor: '#FAF9F7',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 15,
    color: '#2D2926',
  },
  sendBtn: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendBtnText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
});
