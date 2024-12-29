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
      console.log('QR Kod içeriği türü:', typeof data);

      // QR kod içeriğini kontrol et
      if (!data) {
        throw new Error('QR kod boş');
      }

      let parsedData;
      try {
        // Veriyi temizle ve parse et
        const cleanData = data.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        console.log('Temizlenmiş veri:', cleanData);
        
        parsedData = JSON.parse(cleanData);
        console.log('JSON parse başarılı:', parsedData);
      } catch (error) {
        console.error('JSON parse hatası:', error);
        // Alternatif parse denemesi
        try {
          const altData = data.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
          parsedData = JSON.parse(altData);
          console.log('Alternatif parse başarılı');
        } catch (parseError) {
          console.error('Alternatif parse hatası:', parseError);
          throw new Error('Fiş verisi okunamadı');
        }
      }

      // Gerekli alanların varlığını kontrol et
      if (!parsedData.storeName || !parsedData.date || !parsedData.total || !parsedData.items) {
        throw new Error('Geçersiz fiş formatı');
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
        console.log('Fiş başarıyla kaydedildi:', newReceipt);

        // Kısa bir gecikme ekle
        setTimeout(() => {
          router.back();
        }, 1000);
      } catch (storageError) {
        console.error('Depolama hatası:', storageError);
        throw new Error('Fiş kaydedilemedi');
      }

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