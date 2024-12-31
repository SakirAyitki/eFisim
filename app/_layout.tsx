import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Mavi tonlarında renk paleti
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB', // Ana mavi
    secondary: '#0EA5E9', // Açık mavi
    background: '#F0F9FF', // Buz mavisi
    surface: '#FFFFFF',
    onSurface: '#1E3A8A', // Koyu lacivert
    onBackground: '#3B82F6', // Parlak mavi
    accent: '#38BDF8', // Sky mavi
    elevation: {
      level2: 'rgba(37, 99, 235, 0.08)',
    },
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'eFişim',
            headerLargeTitle: true,
            headerTitleStyle: {
              fontSize: 24,
              fontWeight: '700',
            },
          }} 
        />
        <Stack.Screen 
          name="scanner" 
          options={{ 
            title: 'QR Kod Tara',
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen 
          name="[id]" 
          options={{ 
            title: 'Fiş Detayı',
            headerBackTitle: '',
          }}
        />
        <Stack.Screen 
          name="trash" 
          options={{ 
            title: 'Çöp Kutusu',
            headerBackTitle: '',
          }}
        />
      </Stack>
    </PaperProvider>
  );
} 