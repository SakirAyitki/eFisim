import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import receiptService, { Receipt } from '../services/receiptService';

export default function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadReceipts = useCallback(async () => {
    try {
      setIsLoading(true);
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
        "Fişi Çöp Kutusuna Taşı",
        "Bu fişi çöp kutusuna taşımak istediğinize emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          {
            text: "Taşı",
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