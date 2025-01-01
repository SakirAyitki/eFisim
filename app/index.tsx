import { View, FlatList, StyleSheet, Platform, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useTheme, Button, Text, IconButton } from 'react-native-paper';
import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReceiptCard from './components/ReceiptCard';
import EmptyState from './components/EmptyState';
import ActionButtons from './components/ActionButtons';
import useReceipts from './hooks/useReceipts';
import { useAuth } from './contexts/AuthContext';
import type { Receipt } from '../services/receiptService';

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
      loadReceipts();
    }, [loadReceipts])
  );

  const parseReceiptDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  };

  const isSameDay = (date1: Date, date2: Date) => {
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
      try {
        const receiptDate = parseReceiptDate(receipt.date);
        shouldShow = isSameDay(receiptDate, selectedDate);
      } catch (error) {
        console.error('Tarih parse hatası:', error);
        shouldShow = false;
      }
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
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Fiş Listesi</Text>
        <IconButton
          icon="logout"
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
  },
  logoutButton: {
    marginLeft: 8,
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