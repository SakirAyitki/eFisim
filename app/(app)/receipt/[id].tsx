import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, IconButton, useTheme, Surface, Avatar, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../src/config/firebase';
import type { Receipt } from '../../../services/receiptService';
import receiptService from '../../../services/receiptService';
import { PdfService } from '../../../services/pdfService';

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceipt = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'receipts', id.toString());
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setReceipt({
            id: docSnap.id,
            ...docSnap.data()
          } as Receipt);
        } else {
          console.error('Fiş bulunamadı');
        }
      } catch (error) {
        console.error('Fiş yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReceipt();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Fişi Sil",
      "Bu fişi silmek istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Sil",
          onPress: async () => {
            try {
              if (receipt?.id) {
                await receiptService.deleteReceipt(receipt.id);
                router.back();
              }
            } catch (error) {
              console.error('Fiş silinirken hata:', error);
              Alert.alert('Hata', 'Fiş silinirken bir hata oluştu.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      if (!receipt) return;
      await PdfService.generateAndSharePdf(receipt);
    } catch (error) {
      console.error('Fiş paylaşılırken hata:', error);
      Alert.alert('Hata', 'Fiş paylaşılırken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text>Fiş bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header]}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
        />
        <Text variant="titleLarge">Fiş Detayı</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="share-variant"
            onPress={handleShare}
          />
          
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.storeHeader, { backgroundColor: theme.colors.background }]}>
          <Surface style={[styles.storeCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <IconButton
              icon="delete"
              iconColor={theme.colors.error}
              size={24}
              onPress={handleDelete}
              style={styles.deleteButton}
              containerColor={theme.colors.surface}
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
          </View>
          <View style={styles.addressContainer}>
            <Text style={styles.label}>Mağaza Adresi</Text>
            <Text style={[styles.addressValue, { color: theme.colors.onSurface }]}>{receipt.storeAddress}</Text>
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
            </View>

            <View style={styles.grandTotalContainer}>
              <View style={styles.paymentBadgeContainer}>
                {receipt.payment.type === 'card' ? (
                  <View style={styles.cardPaymentInfo}>
                    <View style={styles.bankBadge}>
                      <IconButton
                        icon="credit-card"
                        size={20}
                        iconColor="white"
                        style={styles.paymentIcon}
                      />
                      <Text style={styles.bankName}>{receipt.payment.bank}</Text>
                    </View>
                    {receipt.payment.cardInfo?.installment && (
                      <View style={styles.installmentBadge}>
                        <Text style={styles.installmentText}>
                          {receipt.payment.cardInfo.installment} Taksit
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.cashBadge}>
                    <IconButton
                      icon="cash"
                      size={20}
                      iconColor="white"
                      style={styles.paymentIcon}
                    />
                    <Text style={styles.cashText}>Nakit Ödeme</Text>
                  </View>
                )}
              </View>

              <View style={styles.grandTotalBox}>
                <Text style={styles.grandTotalLabel}>Toplam Tutar</Text>
                <Text style={styles.grandTotalAmount}>
                  ₺{receipt.totals.total.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
            Diğer Bilgiler
          </Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailGridItem}>
              <Text style={styles.label}>Z No</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.footer.zNo}</Text>
            </View>
            <View style={styles.detailGridItem}>
              <Text style={styles.label}>EKÜ No</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.footer.ekuNo}</Text>
            </View>
            <View style={styles.detailGridItem}>
              <Text style={styles.label}>POS Bilgisi</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.footer.posInfo}</Text>
            </View>
            <View style={styles.detailGridItem}>
              <Text style={styles.label}>Mağaza Kodu</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.footer.storeCode}</Text>
            </View>
            {receipt.payment.type === 'card' && receipt.payment.cardInfo && (
              <>
                <View style={styles.detailGridItem}>
                  <Text style={styles.label}>Kart No</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.payment.cardInfo.number}</Text>
                </View>
                <View style={styles.detailGridItem}>
                  <Text style={styles.label}>Taksit</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                    {receipt.payment.cardInfo.installment} x {receipt.payment.cardInfo.installmentAmount} TL
                  </Text>
                </View>
                <View style={styles.detailGridItem}>
                  <Text style={styles.label}>Onay Kodu</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.payment.cardInfo.approvalCode}</Text>
                </View>
                <View style={styles.detailGridItem}>
                  <Text style={styles.label}>Ref No</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.payment.cardInfo.refNo}</Text>
                </View>
                <View style={styles.detailGridItem}>
                  <Text style={styles.label}>Provizyon No</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.payment.cardInfo.provisionNo}</Text>
                </View>
                <View style={styles.detailGridItem}>
                  <Text style={styles.label}>Batch No</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.payment.cardInfo.batchNo}</Text>
                </View>
                <View style={styles.detailGridItem}>
                  <Text style={styles.label}>Terminal ID</Text>
                  <Text style={[styles.value, { color: theme.colors.onSurface }]}>{receipt.payment.cardInfo.terminalId}</Text>
                </View>
              </>
            )}
          </View>
          <View style={styles.barcodeContainer}>
            <Text style={styles.barcodeLabel}>Barkod</Text>
            <View style={styles.barcodeBox}>
              <IconButton
                icon="barcode"
                size={24}
                iconColor="#666"
                style={styles.barcodeIcon}
              />
              <Text style={styles.barcodeText}>{receipt.footer.barcode}</Text>
            </View>
          </View>
          <View style={styles.footerTexts}>
            <Text style={styles.footerText}>{receipt.footer.irsaliyeText}</Text>
            <Text style={styles.footerText}>{receipt.footer.signatureText}</Text>
            <Text style={[styles.footerText, styles.thankYouMessage]}>{receipt.footer.thankYouMessage}</Text>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
  storeHeader: {
    paddingTop: 16,
    marginBottom: 16,
  },
  storeCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    position: 'relative',
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
    fontSize: 14,
  },
  addressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  addressValue: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  itemContainer: {
    marginBottom: 16,
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
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    color: '#666',
    fontSize: 14,
  },
  taxBadge: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  taxBadgeText: {
    color: '#666',
    fontSize: 12,
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
  totalSummary: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    color: '#666',
    fontSize: 14,
  },
  totalAmount: {
    fontWeight: '600',
    fontSize: 16,
  },
  grandTotalContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.12)',
  },
  paymentBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardPaymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankBadge: {
    backgroundColor: '#6200ee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  installmentBadge: {
    backgroundColor: '#6200ee',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  installmentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cashBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  grandTotalBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  grandTotalLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  grandTotalAmount: {
    color: '#6200ee',
    fontWeight: '700',
    fontSize: 28,
  },
  paymentIcon: {
    margin: 0,
    padding: 0,
  },
  deleteButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    margin: 0,
    zIndex: 1,
    elevation: 5,
  },
  barcodeContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
  },
  barcodeLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  barcodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  barcodeIcon: {
    margin: 0,
    padding: 0,
    marginRight: 8,
  },
  barcodeText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    letterSpacing: 1,
  },
  footerTexts: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    textAlign: 'center',
    color: '#666',
  },
  thankYouMessage: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 