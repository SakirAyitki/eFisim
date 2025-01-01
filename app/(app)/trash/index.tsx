import { View, StyleSheet, FlatList, Alert, Pressable } from 'react-native';
import { Text, Surface, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { Receipt, default as ReceiptService } from '../../../services/receiptService';
import { useRouter } from 'expo-router';
import Header from '../../../components/Header';

export default function TrashScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const router = useRouter();
  const styles = getStyles(theme);

  useEffect(() => {
    loadDeletedReceipts();
  }, []);

  const loadDeletedReceipts = async () => {
    try {
      setLoading(true);
      console.log('Silinen fişler yükleniyor...');
      const deletedReceipts = await ReceiptService.getUserReceipts(true); // true = silinen fişleri getir
      console.log('Silinen fişler yüklendi:', deletedReceipts.length);
      setReceipts(deletedReceipts);
    } catch (error) {
      console.error('Silinen fişler yüklenirken hata:', error);
      Alert.alert('Hata', 'Silinen fişler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const restoreReceipt = async (id: string) => {
    try {
      Alert.alert(
        "Fişi Geri Yükle",
        "Bu fişi geri yüklemek istediğinize emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          {
            text: "Geri Yükle",
            onPress: async () => {
              await ReceiptService.restoreReceipt(id);
              await loadDeletedReceipts(); // Listeyi yenile
              Alert.alert('Başarılı', 'Fiş başarıyla geri yüklendi.');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Fiş geri yüklenirken hata:', error);
      Alert.alert('Hata', 'Fiş geri yüklenirken bir hata oluştu.');
    }
  };

  const permanentlyDeleteReceipt = async (id: string) => {
    try {
      Alert.alert(
        "Fişi Kalıcı Olarak Sil",
        "Bu fişi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          {
            text: "Kalıcı Olarak Sil",
            onPress: async () => {
              await ReceiptService.deleteReceipt(id, true);
              await loadDeletedReceipts(); // Listeyi yenile
              Alert.alert('Başarılı', 'Fiş kalıcı olarak silindi.');
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      console.error('Fiş kalıcı olarak silinirken hata:', error);
      Alert.alert('Hata', 'Fiş kalıcı olarak silinirken bir hata oluştu.');
    }
  };

  const emptyTrash = async () => {
    try {
      Alert.alert(
        "Çöp Kutusunu Boşalt",
        "Çöp kutusundaki tüm fişler kalıcı olarak silinecek. Bu işlem geri alınamaz! Devam etmek istiyor musunuz?",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          {
            text: "Boşalt",
            onPress: async () => {
              setLoading(true);
              try {
                const deletedReceipts = await ReceiptService.getUserReceipts(true);
                for (const receipt of deletedReceipts) {
                  if (receipt.id) {
                    await ReceiptService.deleteReceipt(receipt.id, true);
                  }
                }
                await loadDeletedReceipts();
                Alert.alert('Başarılı', 'Çöp kutusu boşaltıldı');
              } catch (error) {
                console.error('Çöp kutusu boşaltılırken hata:', error);
                Alert.alert('Hata', 'Çöp kutusu boşaltılırken bir hata oluştu');
              } finally {
                setLoading(false);
              }
            },
            style: "destructive"
          }
        ]
      );
    } catch (error) {
      console.error('Çöp kutusu boşaltılırken hata:', error);
      Alert.alert('Hata', 'Çöp kutusu boşaltılırken bir hata oluştu');
    }
  };

  const renderItem = ({ item }: { item: Receipt }) => (
    <Surface style={[styles.card]} elevation={0}>
      <View style={styles.cardHeader}>
        <View style={styles.storeInfo}>
          <Text variant="titleMedium" style={styles.storeName}>
            {item.storeName}
          </Text>
          <View style={styles.receiptMeta}>
            <View style={styles.metaTextContainer}>
              <Text variant="labelSmall" style={styles.metaTitle}>
                Alışveriş Tarihi
              </Text>
              <Text variant="labelSmall" style={styles.metaText}>
                {item.date}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.totalContainer}>
          <Text variant="titleMedium" style={styles.totalAmount}>
            ₺{item.totals.total.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.deletedTimeContainer}>
          <Text variant="labelSmall" style={styles.metaTitle}>
            Silinme Tarihi
          </Text>
          <Text variant="labelSmall" style={styles.deletedTime}>
            {item.deletedAt?.toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <IconButton
            icon="restore"
            size={20}
            mode="outlined"
            containerColor={theme.colors.surface}
            iconColor={theme.colors.primary}
            style={styles.actionButton}
            onPress={() => restoreReceipt(item.id!)}
          />
          <IconButton
            icon="delete-forever"
            size={20}
            mode="outlined"
            containerColor={theme.colors.surface}
            iconColor={theme.colors.error}
            style={styles.actionButton}
            onPress={() => permanentlyDeleteReceipt(item.id!)}
          />
        </View>
      </View>
    </Surface>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Header title="Çöp Kutusu" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={[styles.loadingText, { color: theme.colors.onBackground }]}>
          Fişler yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Çöp Kutusu" />

      {receipts.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <IconButton
            icon="delete-outline"
            size={48}
            iconColor={theme.colors.onSurfaceDisabled}
            style={styles.emptyIcon}
          />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Çöp Kutusu Boş
          </Text>
          <Text variant="bodyMedium" style={styles.emptyDescription}>
            Silinen fişleriniz burada görüntülenecektir
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={receipts}
            renderItem={renderItem}
            keyExtractor={item => item.id!}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.floatingButtonContainer}>
            <Pressable 
              style={({pressed}) => [
                styles.floatingButton,
                pressed && {opacity: 0.8}
              ]}
              onPress={emptyTrash}
              android_ripple={{ color: theme.colors.error }}
            >
              <IconButton
                icon="delete-sweep"
                size={22}
                iconColor={theme.colors.surface}
                style={{ margin: 0, padding: 0 }}
              />
              <Text style={styles.floatingButtonText}>Çöp Kutusunu Boşalt</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,

  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: theme.colors.elevation.level1,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '70%',
  },
  backButton: {
    margin: 0,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.onBackground,
    letterSpacing: -0.5,
  },
  statsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statsText: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
    fontSize: 13,
  },
  list: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 3,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
  },
  cardHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeInfo: {
    flex: 1,
    marginRight: 16,
    alignItems: 'flex-start',
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: 'left',
  },
  receiptMeta: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  metaTextContainer: {
    alignItems: 'flex-start',
  },
  metaTitle: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 0.4,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 2,
    fontFamily: 'System',
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.onSurface,
    letterSpacing: 0.3,
    fontWeight: '600',
    fontFamily: 'System',
  },
  totalContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    elevation: 0,
    shadowColor: 'transparent',
  },
  totalAmount: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceVariant,
  },
  deletedTimeContainer: {
    alignItems: 'flex-start',
    marginRight: 16,
  },
  smallIcon: {
    margin: 0,
    padding: 0,
  },
  deletedTime: {
    fontSize: 13,
    color: theme.colors.error,
    letterSpacing: 0.3,
    fontWeight: '600',
    fontFamily: 'System',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    margin: 0,
    borderWidth: 1.5,
    borderColor: theme.colors.outline,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    elevation: 1,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  floatingButton: {
    width: '100%',
    height: 48,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  floatingButtonText: {
    color: theme.colors.surface,
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.1,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.background,
  },
  emptyIcon: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 48,
    marginBottom: 24,
    padding: 20,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyTitle: {
    color: theme.colors.onSurface,
    fontWeight: '800',
    marginBottom: 12,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  emptyDescription: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
    maxWidth: '80%',
  },
  loadingText: {
    marginTop: 20,
    color: theme.colors.onSurfaceVariant,
    fontSize: 16,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
});
