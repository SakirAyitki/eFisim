import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Receipt } from '../types/Receipt';

interface ReceiptCardProps {
  item: Receipt;
  onDelete: (id: string) => void;
}

export default function ReceiptCard({ item, onDelete }: ReceiptCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Üst Kısım */}
      <View style={styles.cardHeader}>
        <View style={styles.storeContainer}>
          <View style={styles.storeIconContainer}>
            <IconButton
              icon="storefront-outline"
              size={20}
              iconColor="white"
              style={styles.storeIcon}
            />
          </View>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{item.storeName}</Text>
            <Text style={styles.dateTime}>{item.date} {item.time}</Text>
          </View>
        </View>
        <IconButton
          icon="trash-can-outline"
          size={18}
          iconColor="#DC2626"
          onPress={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          style={styles.deleteButton}
        />
      </View>

      {/* Alt Kısım */}
      <View style={styles.cardBody}>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fiş No</Text>
            <Text style={styles.receiptNumber}>{item.faturaNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Toplam</Text>
            <View style={styles.totalInfo}>
              <Text style={styles.totalAmount}>₺{item.totals.total.toFixed(2)}</Text>
              <View style={styles.paymentMethod}>
                <IconButton
                  icon={item.payment.type === 'cash' ? 'cash' : 'credit-card-outline'}
                  size={14}
                  iconColor="#6B7280"
                  style={styles.paymentIcon}
                />
                <Text style={styles.paymentText}>
                  {item.payment.type === 'cash' ? 'Nakit' : 'Kart'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 14,
  },
  storeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeIcon: {
    margin: 0,
  },
  storeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  dateTime: {
    fontSize: 13,
    color: '#6B7280',
    letterSpacing: -0.2,
  },
  deleteButton: {
    margin: 0,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  infoGrid: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  receiptNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.3,
  },
  totalInfo: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 19,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    margin: 0,
    padding: 0,
  },
  paymentText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 2,
    letterSpacing: -0.2,
  },
}); 