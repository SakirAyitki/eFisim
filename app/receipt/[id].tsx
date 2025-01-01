import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import type { Receipt } from '../../services/receiptService';

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceipt = async () => {
      try {
        const docRef = doc(db, 'receipts', id as string);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
        />
        <Text variant="titleLarge">Fiş Detayı</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Market Bilgileri */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Market Bilgileri</Text>
          <Text>Ad: {receipt.storeName}</Text>
          <Text>Adres: {receipt.storeAddress}</Text>
          <Text>VKN: {receipt.vdbNo}</Text>
        </View>

        {/* Fiş Bilgileri */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Fiş Bilgileri</Text>
          <Text>Fiş No: {receipt.faturaNo}</Text>
          <Text>Tarih: {receipt.date}</Text>
          <Text>Saat: {receipt.time}</Text>
          <Text>Tür: {receipt.receiptType}</Text>
        </View>

        {/* Ürünler */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Ürünler</Text>
          {receipt.items.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text>{item.name}</Text>
              <Text>{item.quantity} x ₺{item.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Toplam Bilgileri */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Toplam Bilgileri</Text>
          <Text>Ara Toplam: ₺{receipt.totals.subtotal.toFixed(2)}</Text>
          <Text>KDV: ₺{receipt.totals.kdv.toFixed(2)}</Text>
          <Text style={styles.total}>Toplam: ₺{receipt.totals.total.toFixed(2)}</Text>
        </View>

        {/* Ödeme Bilgileri */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Ödeme Bilgileri</Text>
          <Text>Ödeme Tipi: {receipt.payment.type === 'cash' ? 'Nakit' : 'Kart'}</Text>
          {receipt.payment.type === 'card' && (
            <>
              <Text>Banka: {receipt.payment.bank}</Text>
              <Text>Kart No: {receipt.payment.cardInfo?.number}</Text>
              <Text>Taksit: {receipt.payment.cardInfo?.installment}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#1F2937',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 8,
  },
}); 