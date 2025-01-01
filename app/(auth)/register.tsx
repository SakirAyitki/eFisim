import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { registerSchema } from '../types/auth';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
  });
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      console.log('Kayıt işlemi başlatılıyor...');
      console.log('Form verisi:', formData);
      
      setError('');
      console.log('Form validasyonu yapılıyor...');
      const validatedData = registerSchema.parse(formData);
      console.log('Form validasyonu başarılı:', validatedData);
      
      console.log('Firebase kayıt işlemi başlatılıyor...');
      await register(validatedData);
      console.log('Kayıt işlemi başarılı!');
    } catch (err) {
      console.error('Kayıt hatası:', err);
      console.error('Hata detayları:', JSON.stringify(err, null, 2));
      
      if (err instanceof Error) {
        setError(err.message);
        Alert.alert('Kayıt Hatası', `${err.message}\n\nTeknik detay: ${err.stack}`);
      } else {
        const message = 'Kayıt olurken bir hata oluştu';
        setError(message);
        Alert.alert('Kayıt Hatası', `${message}\n\nTeknik detay: ${JSON.stringify(err)}`);
      }
    }
  };

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text variant="headlineMedium" style={styles.title}>
            Kayıt Ol
          </Text>

          <TextInput
            mode="outlined"
            label="Ad"
            value={formData.name}
            onChangeText={handleChange('name')}
            style={styles.input}
            autoCapitalize="words"
          />

          <TextInput
            mode="outlined"
            label="Soyad"
            value={formData.surname}
            onChangeText={handleChange('surname')}
            style={styles.input}
            autoCapitalize="words"
          />

          <TextInput
            mode="outlined"
            label="E-posta"
            value={formData.email}
            onChangeText={handleChange('email')}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Şifre"
            value={formData.password}
            onChangeText={handleChange('password')}
            secureTextEntry
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Kayıt Ol
          </Button>

          <View style={styles.footer}>
            <Text>Zaten hesabınız var mı? </Text>
            <Link href="/(auth)/login" asChild>
              <Text style={styles.link}>Giriş Yap</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
    padding: 4,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    color: '#2196F3',
  },
}); 