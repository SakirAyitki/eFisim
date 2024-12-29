import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, Surface, Avatar, useTheme, IconButton } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Receipt {
  id: string;
  storeName: string;
  storeAddress: string;
  vdbNo: string;
  receiptType: string;
  receiptNo: string;
  date: string;
  time: string;
  ettn: string;
  faturaNo: string;
  customer?: {
    vkn: string;
    name: string;
    address: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    taxRate: number;
  }>;
  payment: {
    type: 'cash' | 'card';
    bank?: string;
    cardInfo?: {
      number: string;
      installment: string;
      installmentAmount: string;
      approvalCode: string;
      refNo: string;
      provisionNo: string;
      batchNo: string;
      terminalId: string;
    };
  };
  totals: {
    subtotal: number;
    kdv: number;
    total: number;
  };
  footer: {
    zNo: string;
    ekuNo: string;
    posInfo: string;
    storeCode: string;
    barcode: string;
    irsaliyeText: string;
    signatureText: string;
    thankYouMessage: string;
  };
}

export default function Trash() {
  const router = useRouter();
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
        "Kalıcı Olarak Sil",
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

  const restoreReceipt = async (receipt: Receipt) => {
    try {
      // Mevcut fişleri al
      const savedReceipts = await AsyncStorage.getItem('receipts');
      let receiptsArray: Receipt[] = [];
      
      if (savedReceipts) {
        try {
          const decodedData = decodeURIComponent(savedReceipts);
          receiptsArray = JSON.parse(decodedData);
        } catch (parseError) {
          receiptsArray = JSON.parse(savedReceipts);
        }
      }
      
      // Fişi geri yükle
      receiptsArray.push(receipt);
      await AsyncStorage.setItem('receipts', JSON.stringify(receiptsArray));

      // Silinen fişlerden kaldır
      const updatedDeletedReceipts = deletedReceipts.filter(r => r.id !== receipt.id);
      await AsyncStorage.setItem('deletedReceipts', JSON.stringify(updatedDeletedReceipts));
      setDeletedReceipts(updatedDeletedReceipts);

      Alert.alert('Başarılı', 'Fiş başarıyla geri yüklendi.');
    } catch (error) {
      console.error('Fiş geri yüklenirken hata:', error);
      Alert.alert('Hata', 'Fiş geri yüklenirken bir hata oluştu.');
    }
  };

  const renderReceiptCard = ({ item }: { item: Receipt }) => (
    <Surface style={styles.surface} elevation={2}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Avatar.Icon 
              size={40} 
              icon="store" 
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={[styles.storeName, { color: theme.colors.onSurface }]}>
                {item.storeName}
              </Text>
              <Text variant="bodySmall" style={styles.cardDetail}>{item.date} {item.time}</Text>
            </View>
            <View style={styles.actionButtons}>
              <IconButton
                icon="restore"
                iconColor={theme.colors.primary}
                onPress={() => restoreReceipt(item)}
              />
              <IconButton
                icon="delete-forever"
                iconColor={theme.colors.error}
                onPress={() => permanentlyDeleteReceipt(item.id)}
              />
            </View>
          </View>

          <View style={[styles.cardBody, { backgroundColor: theme.colors.background }]}>
            <View style={styles.infoRow}>
              <Text variant="bodySmall" style={styles.label}>Fiş No</Text>
              <Text variant="bodyMedium" style={[styles.value, { color: theme.colors.onSurface }]}>
                {item.faturaNo}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text variant="titleMedium" style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
                Toplam
              </Text>
              <View>
                <Text variant="titleMedium" style={[styles.totalAmount, { color: theme.colors.primary }]}>
                  ₺{item.totals.total.toFixed(2)}
                </Text>
                <Text variant="bodySmall" style={styles.paymentMethod}>
                  {item.payment.type === 'cash' ? '💵 Nakit' : '💳 Kart'}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Surface>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {deletedReceipts.length === 0 ? (
        <View style={styles.emptyState}>
          <Avatar.Icon 
            size={80} 
            icon="delete-empty" 
            style={{ backgroundColor: theme.colors.primary, marginBottom: 20 }}
          />
          <Text variant="headlineSmall" style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            Çöp Kutusu Boş
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtitle}>
            Silinen fişler burada görüntülenecek
          </Text>
        </View>
      ) : (
        <FlatList
          data={deletedReceipts}
          renderItem={renderReceiptCard}
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
  list: {
    padding: 16,
  },
  surface: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  storeName: {
    fontWeight: '600',
    color: '#333',
  },
  cardBody: {
    margin: -16,
    marginTop: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#666',
  },
  value: {
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    color: '#333',
    fontWeight: '600',
  },
  totalAmount: {
    color: '#2196F3',
    fontWeight: '700',
  },
  cardDetail: {
    color: '#666',
  },
  paymentMethod: {
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
}); 