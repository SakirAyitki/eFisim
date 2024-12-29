import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4a90e2', // Ana mavi
    secondary: '#63b3ed', // Açık mavi
    background: '#f5f7fa', // Buz mavisi
    surface: '#FFFFFF',
    onSurface: '#2c3e50', // Koyu lacivert
    onBackground: '#4a90e2', // Parlak mavi
    accent: '#63b3ed', // Sky mavi
    elevation: {
      level2: 'rgba(74, 144, 226, 0.08)',
    },
  },
}; 