import { View, StyleSheet } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function ActionButtons() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={styles.fabContainer}>
      <View style={styles.leftFab}>
        <FAB
          icon="delete"
          label="Çöp Kutusu"
          style={[styles.fab, { backgroundColor: theme.colors.error }]}
          onPress={() => router.push('/trash')}
          color="white"
        />
      </View>
      <View style={styles.rightFab}>
        <FAB
          icon="qrcode-scan"
          label="Fiş Tara"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/scanner')}
          color="white"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftFab: {
    flex: 1,
    marginRight: 8,
  },
  rightFab: {
    flex: 1,
    marginLeft: 8,
  },
  fab: {
    width: '100%',
  },
}); 