import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import authService from '../services/authService';

export default function Scanner() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        Alert.alert('Uyarı', 'Lütfen giriş yapın.');
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    
    try {
      console.log('QR Kod içeriği:', data);
      
      let parsedData;
      try {
        // Veriyi temizle ve parse et
        const cleanData = data.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        console.log('Temizlenmiş veri:', cleanData);
        
        parsedData = JSON.parse(cleanData);
        console.log('JSON parse başarılı:', parsedData);
      } catch (error) {
        console.error('JSON parse hatası:', error);
        throw new Error('Fiş verisi okunamadı');
      }

      // Zorunlu alanların varlığını kontrol et
      const requiredFields = [
        'storeName',
        'storeAddress',
        'vdbNo',
        'receiptType',
        'receiptNo',
        'date',
        'time',
        'ettn',
        'faturaNo',
        'items',
        'payment',
        'totals',
        'footer'
      ];

      const missingFields = requiredFields.filter(field => !parsedData[field]);
      if (missingFields.length > 0) {
        console.error('Eksik alanlar:', missingFields);
        throw new Error('Geçersiz fiş formatı: Eksik alanlar - ' + missingFields.join(', '));
      }

      // Items array kontrolü
      if (!Array.isArray(parsedData.items) || parsedData.items.length === 0) {
        throw new Error('Geçersiz fiş formatı: Ürün listesi boş veya geçersiz');
      }

      // Her ürünün gerekli alanlarını kontrol et
      parsedData.items.forEach((item: any, index: number) => {
        if (!item.name || typeof item.quantity !== 'number' || typeof item.price !== 'number' || typeof item.taxRate !== 'number') {
          throw new Error(`Geçersiz ürün formatı: Ürün ${index + 1}`);
        }
      });

      // Totals kontrolü
      if (!parsedData.totals.subtotal || !parsedData.totals.kdv || !parsedData.totals.total) {
        throw new Error('Geçersiz fiş formatı: Toplam bilgileri eksik');
      }

      // Payment kontrolü
      if (!parsedData.payment.type || !['cash', 'card'].includes(parsedData.payment.type)) {
        throw new Error('Geçersiz fiş formatı: Ödeme tipi geçersiz');
      }

      // Kart ödemesi ise cardInfo kontrolü
      if (parsedData.payment.type === 'card' && (!parsedData.payment.cardInfo || !parsedData.payment.bank)) {
        throw new Error('Geçersiz fiş formatı: Kart bilgileri eksik');
      }

      try {
        const existingReceiptsJson = await AsyncStorage.getItem('receipts');
        const existingReceipts = existingReceiptsJson ? JSON.parse(existingReceiptsJson) : [];
        
        const newReceipt = {
          id: Date.now().toString(),
          ...parsedData
        };

        const updatedReceipts = [...existingReceipts, newReceipt];
        await AsyncStorage.setItem('receipts', JSON.stringify(updatedReceipts));
        
        Alert.alert(
          'Başarılı',
          'Fiş başarıyla kaydedildi!',
          [
            {
              text: 'Tamam',
              onPress: () => router.replace('/')
            }
          ]
        );
      } catch (error) {
        console.error('Fiş kaydedilirken hata:', error);
        Alert.alert('Hata', 'Fiş kaydedilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('QR kod işlenirken hata:', error);
      console.error('Hatalı veri:', data);
      Alert.alert(
        'Hata', 
        error instanceof Error ? error.message : 'QR kod okunamadı',
        [
          {
            text: 'Tamam',
            onPress: () => router.replace('/')
          }
        ]
      );
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Kamera izni gerekli</Text>
        <Button onPress={requestPermission}>İzin Ver</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        ratio="16:9"
      >
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}>
            <View style={styles.focusedContainer}>
              <View style={styles.scannerFrame}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </View>
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>QR Fişinizi Taratın</Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    aspectRatio: 9/16,
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  focusedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    backgroundColor: 'transparent',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderLeftWidth: 6,
    borderTopWidth: 6,
    borderColor: 'white',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderColor: 'white',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderLeftWidth: 6,
    borderBottomWidth: 6,
    borderColor: 'white',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderColor: 'white',
  },
  textContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 