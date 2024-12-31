import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReceiptCard from './components/ReceiptCard';
import { Receipt } from './types/Receipt';

export default function Trash() {
  const theme = useTheme();
  const [deletedReceipts, setDeletedReceipts] = useState<Receipt[]>([]);

  const loadDeletedReceipts = useCallback(async () => {
    try {
      const savedReceipts = await AsyncStorage.getItem('deletedReceipts');
      if (savedReceipts) {
        let parsedData;
        try {
          const decodedData = decodeURIComponent(savedReceipts);
          parsedData = JSON.parse(decodedData);
        } catch (parseError) {
          parsedData = JSON.parse(savedReceipts);
        }
        setDeletedReceipts(parsedData);
      }
    } catch (error) {
      console.error('Silinen fişler yüklenirken hata:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDeletedReceipts();
    }, [loadDeletedReceipts])
  );

  const permanentlyDeleteReceipt = async (id: string) => {
    try {
      Alert.alert(
        "Fişi Kalıcı Olarak Sil",
        "Bu fişi kalıcı olarak silmek istediğinize emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          {
            text: "Sil",
            onPress: async () => {
              const updatedReceipts = deletedReceipts.filter(r => r.id !== id);
              await AsyncStorage.setItem('deletedReceipts', JSON.stringify(updatedReceipts));
              setDeletedReceipts(updatedReceipts);
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      console.error('Fiş silinirken hata:', error);
      Alert.alert('Hata', 'Fiş silinirken bir hata oluştu.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {deletedReceipts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            Çöp Kutusu Boş
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Silinen fişler burada görünecek
          </Text>
        </View>
      ) : (
        <FlatList
          data={deletedReceipts}
          renderItem={({ item }) => (
            <ReceiptCard 
              item={item}
              onDelete={permanentlyDeleteReceipt}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
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