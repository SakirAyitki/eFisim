import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import receiptService from '../../services/receiptService';
import type { Receipt } from '../../services/receiptService';

export default function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const migrateLocalReceipts = async () => {
    try {
      const savedReceipts = await AsyncStorage.getItem('receipts');
      if (savedReceipts) {
        let localReceipts;
        try {
          const decodedData = decodeURIComponent(savedReceipts);
          localReceipts = JSON.parse(decodedData);
        } catch (parseError) {
          localReceipts = JSON.parse(savedReceipts);
        }

        console.log('Yerel fişler:', localReceipts);
        
        if (Array.isArray(localReceipts) && localReceipts.length > 0) {
          await receiptService.migrateLocalReceipts(localReceipts);
          await AsyncStorage.removeItem('receipts'); // Yerel verileri temizle
          console.log('Yerel fişler Firestore\'a taşındı');
        } else {
          console.log('Taşınacak yerel fiş bulunamadı');
        }
      }
    } catch (error) {
      console.error('Fişler taşınırken hata:', error);
    }
  };

  const loadReceipts = useCallback(async () => {
    try {
      setIsLoading(true);
      // Önce yerel fişleri Firestore'a taşı
      await migrateLocalReceipts();
      
      // Mevcut Firestore fişlerini güncelle
      await receiptService.migrateExistingReceipts();
      
      // Firestore'dan fişleri al
      const firestoreReceipts = await receiptService.getUserReceipts();
      setReceipts(firestoreReceipts);
    } catch (error) {
      console.error('Fişler yüklenirken hata:', error);
      Alert.alert('Hata', 'Fişler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
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
              await receiptService.deleteReceipt(id);
              setReceipts(prev => prev.filter(r => r.id !== id));
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
    isLoading,
    loadReceipts,
    deleteReceipt,
  };
} 