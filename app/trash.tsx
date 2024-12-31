import { View, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
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

  const emptyTrash = async () => {
    try {
      Alert.alert(
        "Çöp Kutusunu Boşalt",
        "Çöp kutusundaki tüm fişleri kalıcı olarak silmek istediğinize emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          {
            text: "Boşalt",
            onPress: async () => {
              await AsyncStorage.setItem('deletedReceipts', JSON.stringify([]));
              setDeletedReceipts([]);
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      console.error('Çöp kutusu boşaltılırken hata:', error);
      Alert.alert('Hata', 'Çöp kutusu boşaltılırken bir hata oluştu.');
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
        <>
          <FlatList
            data={deletedReceipts}
            renderItem={({ item }) => (
              <ReceiptCard 
                item={item}
                onDelete={permanentlyDeleteReceipt}
                isTrash={true}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <View style={styles.emptyTrashContainer}>
            <TouchableOpacity 
              style={[styles.emptyTrashButton, { backgroundColor: theme.colors.error }]}
              onPress={emptyTrash}
              activeOpacity={0.7}
            >
              <IconButton
                icon="trash-can-outline"
                iconColor="white"
                size={20}
                style={styles.emptyTrashIcon}
              />
              <Text style={styles.emptyTrashText}>Çöp Kutusunu Boşalt</Text>
            </TouchableOpacity>
          </View>
        </>
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
  emptyTrashContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  emptyTrashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  emptyTrashIcon: {
    margin: 0,
    marginRight: 8,
  },
  emptyTrashText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
}); 