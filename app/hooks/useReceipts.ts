import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt } from '../types/Receipt';

export default function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  const loadReceipts = useCallback(async () => {
    try {
      const savedReceipts = await AsyncStorage.getItem('receipts');
      if (savedReceipts) {
        let parsedData;
        try {
          const decodedData = decodeURIComponent(savedReceipts);
          parsedData = JSON.parse(decodedData);
        } catch (parseError) {
          parsedData = JSON.parse(savedReceipts);
        }
        setReceipts(parsedData);
      }
    } catch (error) {
      console.error('Fişler yüklenirken hata:', error);
    }
  }, []);

  const deleteReceipt = async (id: string) => {
    try {
      Alert.alert(
        "Fiş Sil",
        "Bu fişi silmek istediğinize emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          {
            text: "Sil",
            onPress: async () => {
              const savedReceipts = await AsyncStorage.getItem('receipts');
              if (savedReceipts) {
                let receiptsArray: Receipt[];
                try {
                  const decodedData = decodeURIComponent(savedReceipts);
                  receiptsArray = JSON.parse(decodedData);
                } catch (parseError) {
                  receiptsArray = JSON.parse(savedReceipts);
                }

                const receiptToDelete = receiptsArray.find(r => r.id === id);
                const updatedReceipts = receiptsArray.filter(r => r.id !== id);
                
                // Fişi çöp kutusuna taşı
                if (receiptToDelete) {
                  const deletedReceipts = await AsyncStorage.getItem('deletedReceipts');
                  let deletedReceiptsArray = [];
                  if (deletedReceipts) {
                    try {
                      const decodedData = decodeURIComponent(deletedReceipts);
                      deletedReceiptsArray = JSON.parse(decodedData);
                    } catch (parseError) {
                      deletedReceiptsArray = JSON.parse(deletedReceipts);
                    }
                  }
                  deletedReceiptsArray.push(receiptToDelete);
                  await AsyncStorage.setItem('deletedReceipts', JSON.stringify(deletedReceiptsArray));
                }
                
                await AsyncStorage.setItem('receipts', JSON.stringify(updatedReceipts));
                setReceipts(updatedReceipts);
              }
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

  return {
    receipts,
    loadReceipts,
    deleteReceipt,
  };
} 