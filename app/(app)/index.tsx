import { View, FlatList, StyleSheet, Platform, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme, Button, Text, IconButton } from 'react-native-paper';
import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReceiptCard from '../components/ReceiptCard';
import EmptyState from '../components/EmptyState';
import ActionButtons from '../components/ActionButtons';
import useReceipts from '../hooks/useReceipts';
import { useAuth } from '../contexts/AuthContext';
import type { Receipt } from '../../services/receiptService';
import { auth } from '../../src/config/firebase';

export default function Home() {
  const theme = useTheme();
  const { logout } = useAuth();
  const { receipts, loadReceipts, deleteReceipt } = useReceipts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }
      loadReceipts();
    }, [loadReceipts])
  );

  const parseReceiptDate = (dateStr: string) => {
    try {
      // Tarih formatını kontrol et (GG.AA.YYYY)
      if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
        console.error('Geçersiz tarih formatı:', dateStr);
        return null;
      }

      const [day, month, year] = dateStr.split('.').map(Number);
      
      // Geçerli tarih değerlerini kontrol et
      if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000) {
        console.error('Geçersiz tarih değerleri:', { day, month, year });
        return null;
      }

      const date = new Date(year, month - 1, day);
      
      // Oluşturulan tarihin geçerli olup olmadığını kontrol et
      if (isNaN(date.getTime())) {
        console.error('Geçersiz tarih oluşturuldu:', date);
        return null;
      }

      return date;
    } catch (error) {
      console.error('Tarih ayrıştırma hatası:', error);
      return null;
    }
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const filteredReceipts = receipts.filter((receipt: Receipt) => {
    if (!receipt || !receipt.storeName) return false;

    let shouldShow = true;

    // Market adı filtresi
    if (searchQuery !== '') {
      shouldShow = receipt.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    }

    // Tarih filtresi
    if (shouldShow && selectedDate && receipt.date) {
      const receiptDate = parseReceiptDate(receipt.date);
      shouldShow = isSameDay(receiptDate, selectedDate);
    }

    return shouldShow;
  });

  const onChangeDate = (event: any, selected: Date | undefined) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selected) {
      setSelectedDate(selected);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Tarih seçin';
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearDate = () => {
    setSelectedDate(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header]}>
        <View style={styles.leftContainer} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Fiş Listesi</Text>
        </View>
        <View style={styles.rightContainer}>
          <IconButton
            icon="logout"
            size={24}
            onPress={handleLogout}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <TextInput
              ref={inputRef}
              placeholder="Market adı ile ara..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={[
                styles.searchInput,
                { 
                  borderColor: theme.colors.primary,
                  color: theme.colors.onBackground,
                  fontFamily: theme.fonts.default.fontFamily,
                  fontSize: 14,
                }
              ]}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              textAlign="center"
              textAlignVertical="center"
              caretHidden={true}
            />
          </View>
        </View>
        <View style={styles.dateContainer}>
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            style={[styles.dateButton, { borderColor: theme.colors.primary }]}
          >
            <Text>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
          {selectedDate && (
            <TouchableOpacity 
              onPress={clearDate}
              style={styles.clearButton}
            >
              <Text style={{ color: theme.colors.error }}>Sil</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
      </View>

      {filteredReceipts.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredReceipts}
          renderItem={({ item }) => (
            <ReceiptCard 
              item={item} 
              onDelete={deleteReceipt}
            />
          )}
          keyExtractor={(item) => item.id || ''}
          contentContainerStyle={styles.list}
        />
      )}
      <ActionButtons />
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
  filterContainer: {
    padding: 8,
    gap: 4,
  },
  searchContainer: {
    height: 36,
    justifyContent: 'center',
  },
  searchWrapper: {
    position: 'relative',
    height: 36,
  },
  searchInput: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: 36,
    borderWidth: 1,
    borderRadius: 4,
    padding: 0,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateButton: {
    flex: 1,
    height: 36,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    padding: 4,
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
}); 