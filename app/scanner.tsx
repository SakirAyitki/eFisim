import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Scanner() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    try {
      setScanned(true);
      console.log('QR Kod içeriği:', data);

      // QR kod içeriğini kontrol et
      if (!data) {
        throw new Error('QR kod boş');
      }

      const receiptData = JSON.parse(data);
      console.log('Parse edilmiş veri:', receiptData);

      // Gerekli alanların varlığını kontrol et
      if (!receiptData.storeName || !receiptData.date || !receiptData.total || !receiptData.items) {
        throw new Error('Geçersiz fiş formatı');
      }

      const existingReceiptsJson = await AsyncStorage.getItem('receipts');
      const existingReceipts = existingReceiptsJson ? JSON.parse(existingReceiptsJson) : [];
      
      const newReceipt = {
        id: Date.now().toString(),
        ...receiptData
      };

      const updatedReceipts = [...existingReceipts, newReceipt];
      
      await AsyncStorage.setItem('receipts', JSON.stringify(updatedReceipts));
      console.log('Fiş başarıyla kaydedildi:', newReceipt);

      // Kısa bir gecikme ekle
      setTimeout(() => {
        router.back();
      }, 1000);

    } catch (error) {
      console.error('QR kod işlenirken hata:', error);
      console.error('Hatalı veri:', data);
      alert('Fiş okunamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      setScanned(false);
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
      >
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            Fiş QR kodunu tarayın
          </Text>
        </View>
        {scanned && (
          <Button 
            mode="contained" 
            onPress={() => setScanned(false)}
            style={styles.button}
          >
            Tekrar Tara
          </Button>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
  },
  button: {
    position: 'absolute',
    bottom: 50,
    width: '80%',
    alignSelf: 'center',
  },
}); 