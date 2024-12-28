import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, useTheme, IconButton, Avatar, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Receipt {
  id: string;
  storeName: string;
  storeAddress: string;
  date: string;
  time: string;
  total: number;
  fiscalId: string;
  paymentMethod: 'cash' | 'card';
  mersisNo: string;
  taxNumber: string;
  phoneNumber: string;
  cashierName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  additionalInfo?: string;
}

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    try {
      const savedReceipts = await AsyncStorage.getItem('receipts');
      if (savedReceipts) {
        const receipts: Receipt[] = JSON.parse(savedReceipts);
        const foundReceipt = receipts.find(r => r.id === id);
        setReceipt(foundReceipt || null);
      }
    } catch (error) {
      console.error('Fiş yüklenirken hata:', error);
    }
  };

  const deleteReceipt = async () => {
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
                const receipts: Receipt[] = JSON.parse(savedReceipts);
                const updatedReceipts = receipts.filter(r => r.id !== id);
                await AsyncStorage.setItem('receipts', JSON.stringify(updatedReceipts));
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

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text>Fiş bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Surface style={[styles.storeCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <IconButton
            icon="delete"
            iconColor={theme.colors.error}
            size={24}
            onPress={deleteReceipt}
            style={styles.deleteButton}
          />
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
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.fiscalId}</Text>
          </View>
          <View style={styles.detailGridItem}>
            <Text style={styles.label}>Ödeme Yöntemi</Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>
              {receipt.paymentMethod === 'cash' ? '💵 Nakit' : '💳 Kart'}
            </Text>
          </View>
          <View style={styles.detailGridItem}>
            <Text style={styles.label}>Kasiyer</Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.cashierName}</Text>
          </View>
          <View style={styles.detailGridItem}>
            <Text style={styles.label}>Mersis No</Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.mersisNo}</Text>
          </View>
          <View style={styles.detailGridItem}>
            <Text style={styles.label}>Vergi No</Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.taxNumber}</Text>
          </View>
          <View style={styles.detailGridItem}>
            <Text style={styles.label}>Telefon</Text>
            <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.phoneNumber}</Text>
          </View>
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.label}>Adres</Text>
          <Text style={[styles.addressValue, { color: theme.colors.onSurface }]}>{receipt.storeAddress}</Text>
        </View>
      </Surface>

      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
          Ürünler
        </Text>
        {receipt.items.map((item, index) => (
          <View key={index}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.onSurface }]}>{item.name}</Text>
                <Text style={styles.itemQuantity}>{item.quantity} adet × ₺{item.price.toFixed(2)}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.colors.onSurface }]}>
                ₺{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
            {index < receipt.items.length - 1 && <Divider style={styles.itemDivider} />}
          </View>
        ))}
        <View style={styles.totalContainer}>
          <View style={styles.totalRow}>
            <Text variant="titleMedium" style={styles.totalLabel}>Toplam</Text>
            <Text variant="titleLarge" style={[styles.totalAmount, { color: theme.colors.primary }]}>
              ₺{receipt.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    marginBottom: 16,
  },
  storeCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeDetails: {
    marginLeft: 16,
    flex: 1,
  },
  storeName: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
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
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 20,
    fontWeight: '700',
    fontSize: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailGridItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  label: {
    color: '#666',
    marginBottom: 4,
    fontSize: 12,
  },
  value: {
    fontWeight: '600',
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    color: '#666',
    fontSize: 14,
  },
  itemPrice: {
    fontWeight: '600',
    fontSize: 16,
  },
  itemDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  totalContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: '600',
    fontSize: 18,
  },
  totalAmount: {
    fontWeight: '700',
    fontSize: 24,
  },
  deleteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    margin: 0,
  },
  addressContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  addressValue: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
}); 