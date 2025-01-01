import { View, StyleSheet, Alert } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import receiptService, { Receipt } from '../services/receiptService';

export default function ReceiptDetail() {
  const theme = useTheme();
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header]}>
        <View style={styles.leftContainer}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Fiş Detayı</Text>
        </View>
        <View style={styles.rightContainer}>
          <IconButton
            icon="delete-outline"
            size={24}
            onPress={handleDelete}
          />
        </View>
      </View>

      {/* Fiş detay içeriği buraya gelecek */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
  },
  leftContainer: {
    width: 50,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  rightContainer: {
    width: 50,
    position: 'absolute',
    right: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 