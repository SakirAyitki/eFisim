import { View, StyleSheet } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

export default function ActionButtons() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <FAB
        icon="qrcode-scan"
        label="QR Kod Tara"
        onPress={() => router.push('/scan')}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
      />
      <FAB
        icon="delete-outline"
        label="Çöp Kutusu"
        onPress={() => router.push('/(app)/trash')}
        style={[styles.fab, { backgroundColor: theme.colors.error }]}
        color="white"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 16,
  },
  fab: {
    borderRadius: 16,
  },
}); 