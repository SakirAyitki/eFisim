import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';

export default function EmptyState() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <IconButton
        icon="receipt-text-outline"
        size={48}
        iconColor={theme.colors.onSurfaceDisabled}
        style={styles.icon}
      />
      <Text variant="headlineSmall" style={styles.title}>
        Fiş Bulunamadı
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        Henüz hiç fişiniz yok veya arama kriterlerinize uygun fiş bulunamadı
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    backgroundColor: '#f0f0f0',
    borderRadius: 48,
    marginBottom: 24,
    padding: 20,
  },
  title: {
    fontWeight: '800',
    marginBottom: 12,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
    maxWidth: '80%',
    opacity: 0.7,
  },
}); 