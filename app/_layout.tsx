import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { View, Animated, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';

const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4a90e2',
    secondary: '#63b3ed',
    background: '#f5f7fa',
    surface: '#FFFFFF',
    onSurface: '#2c3e50',
    onBackground: '#4a90e2',
    accent: '#63b3ed',
    elevation: {
      level2: 'rgba(74, 144, 226, 0.08)',
    },
  },
};

const navigationTheme = {
  dark: false,
  colors: {
    primary: '#4a90e2',
    background: '#f5f7fa',
    card: '#FFFFFF',
    text: '#2c3e50',
    border: '#e2e8f0',
    notification: '#4a90e2',
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: 'System',
      fontWeight: 'bold' as const,
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '900' as const,
    },
  }
};

export default function Layout() {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);
  const translateYTitle = new Animated.Value(50);
  const translateYSubtitle = new Animated.Value(30);
  const rotateAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);
  const titleScaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    const startAnimations = async () => {
      // Logo pulse animasyonu
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      ).start();

      Animated.sequence([
        Animated.parallel([
          // Logo animasyonları
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        // Başlık ve alt başlık animasyonları
        Animated.stagger(150, [
          Animated.parallel([
            Animated.spring(translateYTitle, {
              toValue: 0,
              friction: 4,
              tension: 50,
              useNativeDriver: true,
            }),
            Animated.spring(titleScaleAnim, {
              toValue: 1,
              friction: 4,
              tension: 50,
              useNativeDriver: true,
            }),
          ]),
          Animated.spring(translateYSubtitle, {
            toValue: 0,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      await new Promise(resolve => setTimeout(resolve, 2400));
      setIsReady(true);
    };

    startAnimations();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isReady) {
    return (
      <View style={[styles.container, styles.splashBackground]}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: Animated.multiply(scaleAnim, pulseAnim) },
                { rotate: spin }
              ],
            },
          ]}
        >
          <View style={styles.logo}>
            <Image 
              source={require('../assets/images/icon.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: translateYTitle },
                { scale: titleScaleAnim }
              ],
            },
          ]}
        >
          eFişim
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYSubtitle }],
            },
          ]}
        >
          Dijital Fişleriniz Güvende
        </Animated.Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <Stack 
          screenOptions={{ 
            headerShown: true,
            headerStyle: {
              backgroundColor: paperTheme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
            headerShadowVisible: false,
            headerTitleAlign: 'center',
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: paperTheme.colors.background,
            },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: "Fiş Listesi"  // Ana sayfa başlığı
            }} 
          />
          <Stack.Screen 
            name="trash" 
            options={{ 
              title: "Çöp Kutusu"  // Çöp kutusu sayfası başlığı
            }} 
          />
          <Stack.Screen 
            name="scanner" 
            options={{ 
              title: "Fiş Tara"  // Çöp kutusu sayfası başlığı
            }} 
          />
          <Stack.Screen 
            name="receipt/[id]" 
            options={{ 
              title: "Fiş Detayı"  // Çöp kutusu sayfası başlığı
            }} 
          />
        </Stack>
        
      </ThemeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashBackground: {
    backgroundColor: '#f5f7fa',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 8,
  },
}); 