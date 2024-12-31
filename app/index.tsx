import { View, FlatList, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import ReceiptCard from './components/ReceiptCard';
import EmptyState from './components/EmptyState';
import ActionButtons from './components/ActionButtons';
import useReceipts from './hooks/useReceipts';

export default function Home() {
  const theme = useTheme();
  const { receipts, loadReceipts, deleteReceipt } = useReceipts();

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [loadReceipts])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {receipts.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={receipts}
          renderItem={({ item }) => (
            <ReceiptCard 
              item={item} 
              onDelete={deleteReceipt}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
      <ActionButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingVertical: 8,
  },
}); 