import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema } from '../types/auth';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const handleLogin = async () => {
    try {
      setError('');
      
      // Boş alan kontrolü
      if (!email && !password) {
        setError('Lütfen e-posta ve şifrenizi girin');
        return;
      }
      if (!email) {
        setError('Lütfen e-posta adresinizi girin');
        return;
      }
      if (!password) {
        setError('Lütfen şifrenizi girin');
        return;
      }

      const data = { email, password };
      const validatedData = loginSchema.parse(data);
      await login(validatedData);
      router.replace('/');
    } catch (err) {
      if (err instanceof Error) {
        // Zod doğrulama hatalarını kontrol et
        if (err.message.includes('email')) {
          setError('Lütfen geçerli bir e-posta adresi girin');
        } else if (err.message.includes('password')) {
          setError('Şifreniz en az 6 karakter olmalıdır');
        } else {
          setError(err.message);
        }
      } else {
        setError('Giriş yapılırken bir hata oluştu');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -500}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoText, { color: theme.colors.primary }]}>
              eFişim
            </Text>
          </View>

          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Hoş Geldiniz
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Devam etmek için giriş yapın
          </Text>

          <TextInput
            mode="outlined"
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            left={<TextInput.Icon icon="email" color={theme.colors.primary} />}
          />

          <TextInput
            mode="outlined"
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Giriş Yap
          </Button>

          <View style={styles.footer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Hesabınız yok mu? </Text>
            <Link href="/(auth)/register" asChild>
              <Text style={[styles.link, { color: theme.colors.primary }]}>Kayıt Ol</Text>
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  error: {
    color: '#D32F2F',
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
  link: {
    fontWeight: '600',
  },
}); 