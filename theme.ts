import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee', // Ana mor
    secondary: '#bb86fc', // Açık mor
    background: '#f5f7fa',
    surface: '#FFFFFF',
    onSurface: '#2c3e50',
    onBackground: '#6200ee', // Mor
    accent: '#9c27b0', // Koyu mor
    surfaceVariant: '#6200ee', // İkon arka planı için mor
    onSurfaceVariant: '#6200ee', // Metin renkleri için mor
    outlineVariant: '#6200ee', // Çizgi renkleri için mor
    text: '#6200ee', // Metin rengi mor
    notification: '#6200ee', // Bildirim rengi mor
    onPrimaryContainer: '#6200ee', // Container içi metin rengi mor
    onSecondaryContainer: '#6200ee', // İkincil container içi metin rengi mor
    onTertiaryContainer: '#6200ee', // Üçüncül container içi metin rengi mor
    elevation: {
      level2: 'rgba(98, 0, 238, 0.08)',
    },
  },
}; 