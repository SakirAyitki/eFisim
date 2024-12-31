import { View, StyleSheet } from 'react-native';
import { Text, Avatar, useTheme } from 'react-native-paper';

export default function EmptyState() {
  const theme = useTheme();

  return (
    <View style={styles.emptyState}>
      <Avatar.Icon 
        size={80} 
        icon="receipt" 
        style={{ backgroundColor: theme.colors.primary, marginBottom: 20 }}
      />
      <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
        Henüz hiç fişiniz yok
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        QR kod okutarak fiş ekleyebilirsiniz
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    color: '#333',
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
  },
}); 