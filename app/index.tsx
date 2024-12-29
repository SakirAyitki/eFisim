import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, FAB, Card, Surface, Avatar, useTheme, IconButton } from 'react-native-paper';
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

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
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

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [loadReceipts])
  );

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

  const renderReceiptCard = ({ item }: { item: Receipt }) => (
    <Surface style={styles.surface} elevation={2}>
      <Card style={styles.card} onPress={() => router.push(`/receipt/${item.id}`)}>
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
            <IconButton
              icon="delete"
              iconColor={theme.colors.error}
              onPress={(e) => {
                e.stopPropagation();
                deleteReceipt(item.id);
              }}
              style={styles.deleteButton}
            />
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
      {receipts.length === 0 ? (
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
      ) : (
        <FlatList
          data={receipts}
          renderItem={renderReceiptCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
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
  storeName: {
    fontWeight: '600',
    color: '#333',
  },
  cardDetail: {
    color: '#666',
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
  paymentMethod: {
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  fabContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftFab: {
    alignSelf: 'flex-start',
  },
  rightFab: {
    alignSelf: 'flex-end',
  },
  fab: {
    borderRadius: 28,
  },
  deleteButton: {
    marginLeft: 8,
  },
}); 