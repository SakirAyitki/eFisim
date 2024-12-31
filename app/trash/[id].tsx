import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, IconButton, Avatar, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt } from '../types/Receipt';

export default function DeletedReceiptDetail() {
  const { id } = useLocalSearchParams();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    loadReceipt();
  }, [id]);

    const loadReceipt = async () => {
      try {
        const savedReceipts = await AsyncStorage.getItem('deletedReceipts');
        if (savedReceipts) {
          let receiptsArray: Receipt[];
          try {
            const decodedData = decodeURIComponent(savedReceipts);
            receiptsArray = JSON.parse(decodedData);
          } catch (parseError) {
            receiptsArray = JSON.parse(savedReceipts);
          }
          const foundReceipt = receiptsArray.find(r => r.id === id);
          if (foundReceipt) {
            setReceipt(foundReceipt);
          }
        }
      } catch (error) {
        console.error('Fiş yüklenirken hata:', error);
      }
    };

  const permanentlyDeleteReceipt = async () => {
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
              const savedReceipts = await AsyncStorage.getItem('deletedReceipts');
              if (savedReceipts) {
                let receiptsArray: Receipt[];
                try {
                  const decodedData = decodeURIComponent(savedReceipts);
                  receiptsArray = JSON.parse(decodedData);
                } catch (parseError) {
                  receiptsArray = JSON.parse(savedReceipts);
                }
                const updatedReceipts = receiptsArray.filter(r => r.id !== id);
                await AsyncStorage.setItem('deletedReceipts', JSON.stringify(updatedReceipts));
                router.back();
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

  const restoreReceipt = async () => {
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
      
      if (receipt) {
        // Fişi geri yükle
        receiptsArray.push(receipt);
        await AsyncStorage.setItem('receipts', JSON.stringify(receiptsArray));

        // Silinen fişlerden kaldır
        const deletedReceipts = await AsyncStorage.getItem('deletedReceipts');
        if (deletedReceipts) {
          let deletedArray: Receipt[];
          try {
            const decodedData = decodeURIComponent(deletedReceipts);
            deletedArray = JSON.parse(decodedData);
          } catch (parseError) {
            deletedArray = JSON.parse(deletedReceipts);
          }
          const updatedDeletedReceipts = deletedArray.filter(r => r.id !== id);
          await AsyncStorage.setItem('deletedReceipts', JSON.stringify(updatedDeletedReceipts));
        }

        Alert.alert('Başarılı', 'Fiş başarıyla geri yüklendi.');
        router.back();
      }
    } catch (error) {
      console.error('Fiş geri yüklenirken hata:', error);
      Alert.alert('Hata', 'Fiş geri yüklenirken bir hata oluştu.');
    }
  };

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text>Fiş bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <Surface style={[styles.storeCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <View style={styles.storeInfo}>
              <Avatar.Icon 
                size={60} 
                icon="store" 
                style={{ backgroundColor: theme.colors.primary }}
                color="white"
              />
              <View style={styles.storeDetails}>
                <Text variant="titleLarge" style={[styles.storeName, { color: theme.colors.onSurface }]}>
                  {receipt.storeName}
                </Text>
                <View style={styles.dateTimeContainer}>
                  <IconButton
                    icon="calendar"
                    size={16}
                    style={styles.smallIcon}
                  />
                  <Text variant="bodyMedium" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
                    {receipt.date}
                  </Text>
                  <IconButton
                    icon="clock-outline"
                    size={16}
                    style={styles.smallIcon}
                  />
                  <Text variant="bodyMedium" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
                    {receipt.time}
                  </Text>
                </View>
              </View>
            </View>
          </Surface>
        </View>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Fiş Detayları
          </Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailGridItem}>
              <Text style={styles.label}>Fiş No</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.faturaNo}</Text>
            </View>
            <View style={styles.detailGridItem}>
              <Text style={styles.label}>VDB No</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.vdbNo}</Text>
            </View>
            <View style={styles.detailGridItem}>
              <Text style={styles.label}>ETTN</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.ettn}</Text>
            </View>
            <View style={styles.detailGridItem}>
              <Text style={styles.label}>Fiş Türü</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.receiptType}</Text>
            </View>
            {receipt.customer && (
              <>
                <View style={styles.detailGridItem}>
                  <Text style={styles.label}>Müşteri</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.customer.name}</Text>
                </View>
                <View style={styles.detailGridItem}>
                  <Text style={styles.label}>VKN</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.customer.vkn}</Text>
                </View>
              </>
            )}
          </View>
          <View style={styles.addressContainer}>
            <Text style={styles.label}>Mağaza Adresi</Text>
            <Text style={[styles.addressValue, { color: theme.colors.onSurface }]}>{receipt.storeAddress}</Text>
            {receipt.customer && (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>Müşteri Adresi</Text>
                <Text style={[styles.addressValue, { color: theme.colors.onSurface }]}>{receipt.customer.address}</Text>
              </>
            )}
          </View>
        </Surface>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Ürünler
          </Text>
          {receipt.items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>{item.name}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemQuantity}>{item.quantity} adet × ₺{item.price.toFixed(2)}</Text>
                    <View style={styles.taxBadge}>
                      <Text style={styles.taxBadgeText}>KDV %{item.taxRate}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
                  ₺{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
              {index < receipt.items.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}
          <View style={styles.totalContainer}>
            <View style={styles.totalSummary}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Ara Toplam</Text>
                <Text style={[styles.totalAmount, { color: theme.colors.onSurface }]}>
                  ₺{receipt.totals.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>KDV</Text>
                <Text style={[styles.totalAmount, { color: theme.colors.onSurface }]}>
                  ₺{receipt.totals.kdv.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={[styles.totalLabel, styles.grandTotalLabel]}>Toplam</Text>
                <Text style={[styles.totalAmount, styles.grandTotalAmount, { color: theme.colors.primary }]}>
                  ₺{receipt.totals.total.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Ödeme Bilgileri
          </Text>
          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.label}>Ödeme Yöntemi</Text>
              <View style={styles.paymentMethodContainer}>
                <IconButton
                  icon={receipt.payment.type === 'cash' ? 'cash' : 'credit-card'}
                  size={20}
                  iconColor={theme.colors.primary}
                  style={styles.paymentIcon}
                />
                <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                  {receipt.payment.type === 'cash' ? 'Nakit' : 'Kredi Kartı'}
                </Text>
              </View>
            </View>
            {receipt.payment.type === 'card' && receipt.payment.cardInfo && (
              <>
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Banka</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.payment.bank}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.label}>Kart Numarası</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.payment.cardInfo.number}</Text>
                </View>
                {receipt.payment.cardInfo.installment && (
                  <>
                    <View style={styles.paymentRow}>
                      <Text style={styles.label}>Taksit</Text>
                      <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                        {receipt.payment.cardInfo.installment} x {receipt.payment.cardInfo.installmentAmount}
                      </Text>
                    </View>
                    <View style={styles.paymentRow}>
                      <Text style={styles.label}>Onay Kodu</Text>
                      <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                        {receipt.payment.cardInfo.approvalCode}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </Surface>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Diğer Bilgiler
          </Text>
          <View style={styles.footerDetails}>
            <View style={styles.footerRow}>
              <Text style={styles.label}>Z No</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.footer.zNo}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.label}>EKU No</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.footer.ekuNo}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.label}>POS Bilgisi</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.footer.posInfo}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.label}>Mağaza Kodu</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.footer.storeCode}</Text>
            </View>
          </View>
        </Surface>
      </ScrollView>
      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={restoreReceipt}
          activeOpacity={0.7}
        >
          <IconButton
            icon="restore"
            iconColor="white"
            size={20}
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, { color: 'white' }]}>Geri Yükle</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
          onPress={permanentlyDeleteReceipt}
          activeOpacity={0.7}
        >
          <IconButton
            icon="delete-forever"
            iconColor="white"
            size={20}
            style={styles.actionIcon}
          />
          <Text style={[styles.actionText, { color: 'white' }]}>Tamamen Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  storeCard: {
    padding: 16,
    borderRadius: 12,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  storeDetails: {
    marginLeft: 16,
    flex: 1,
  },
  storeName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIcon: {
    margin: 0,
    padding: 0,
  },
  date: {
    marginRight: 12,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailGridItem: {
    width: '45%',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
  addressContainer: {
    marginTop: 16,
  },
  addressValue: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  itemContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  taxBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  taxBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemDivider: {
    marginVertical: 12,
  },
  totalContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  totalSummary: {
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '500',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  grandTotalAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  paymentDetails: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    margin: 0,
    marginRight: 4,
  },
  footerDetails: {
    gap: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionIcon: {
    margin: 0,
    marginRight: 8,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
}); 