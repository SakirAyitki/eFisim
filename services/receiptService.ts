import { 
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../src/config/firebase';

export interface Receipt {
  id?: string;
  userId: string;
  storeName: string;
  storeAddress: string;
  vdbNo: string;
  receiptType: string;
  receiptNo: string;
  date: string;
  time: string;
  ettn: string;
  faturaNo: string;
  customer?: {
    vkn: string;
    name: string;
    address: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    taxRate: number;
  }>;
  payment: {
    type: 'cash' | 'card';
    bank?: string;
    cardInfo?: {
      number: string;
      installment: string;
      installmentAmount: string;
      approvalCode: string;
      refNo: string;
      provisionNo: string;
      batchNo: string;
      terminalId: string;
    };
  };
  totals: {
    subtotal: number;
    kdv: number;
    total: number;
  };
  footer: {
    zNo: string;
    ekuNo: string;
    posInfo: string;
    storeCode: string;
    barcode: string;
    irsaliyeText: string;
    signatureText: string;
    thankYouMessage: string;
  };
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdAt?: Date;
}

class ReceiptService {
  private collection = 'receipts';

  async addReceipt(receipt: Omit<Receipt, 'id' | 'userId'>): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Kullanıcı girişi yapılmamış');

      const docRef = await addDoc(collection(db, this.collection), {
        ...receipt,
        userId: user.uid,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date()
      });

      console.log('Yeni fiş eklendi:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Fiş eklenirken hata:', error);
      throw new Error('Fiş eklenirken hata: ' + error.message);
    }
  }

  async getUserReceipts(includeDeleted = false): Promise<Receipt[]> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Kullanıcı girişi yapılmamış');

      console.log('Sorgu yapılıyor:', includeDeleted ? 'Silinen fişler' : 'Aktif fişler');

      // Temel sorgu
      const baseQuery = query(
        collection(db, this.collection),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(baseQuery);
      const receipts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          deletedAt: data.deletedAt?.toDate(),
          isDeleted: !!data.isDeleted // Boolean'a çevir
        } as Receipt;
      });

      // Bellek üzerinde filtreleme yap
      const filteredReceipts = includeDeleted 
        ? receipts.filter(r => r.isDeleted === true)  // Sadece silinen fişleri getir
        : receipts.filter(r => r.isDeleted !== true); // Sadece silinmeyen fişleri getir

      console.log('Tüm fiş sayısı:', receipts.length);
      console.log('Filtrelenmiş fiş sayısı:', filteredReceipts.length);
      console.log('Silinen fiş sayısı:', receipts.filter(r => r.isDeleted).length);
      console.log('Aktif fiş sayısı:', receipts.filter(r => !r.isDeleted).length);

      return filteredReceipts;
    } catch (error: any) {
      console.error('Fişler alınırken hata:', error);
      throw new Error('Fişler alınırken hata: ' + error.message);
    }
  }

  async deleteReceipt(id: string, permanent = false): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Kullanıcı girişi yapılmamış');

      console.log('Fiş siliniyor:', id, permanent ? 'Kalıcı' : 'Geçici');

      const docRef = doc(db, this.collection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Fiş bulunamadı');
      }

      if (permanent) {
        await deleteDoc(docRef);
        console.log('Fiş kalıcı olarak silindi');
      } else {
        const updateData = {
          isDeleted: true,
          deletedAt: new Date()
        };
        await updateDoc(docRef, updateData);
        console.log('Fiş çöp kutusuna taşındı:', updateData);

        // Güncelleme sonrası kontrol
        const updatedDoc = await getDoc(docRef);
        console.log('Güncellenmiş fiş:', updatedDoc.data());
      }
    } catch (error: any) {
      console.error('Fiş silinirken hata:', error);
      throw new Error('Fiş silinirken hata: ' + error.message);
    }
  }

  async restoreReceipt(id: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Kullanıcı girişi yapılmamış');

      await updateDoc(doc(db, this.collection, id), {
        isDeleted: false,
        deletedAt: null
      });
    } catch (error: any) {
      console.error('Fiş geri yüklenirken hata:', error);
      throw new Error('Fiş geri yüklenirken hata: ' + error.message);
    }
  }

  async migrateExistingReceipts(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Kullanıcı girişi yapılmamış');

      const q = query(
        collection(db, this.collection),
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Eğer eski yapıda ise güncelle
        if (!data.totals || !data.payment) {
          const updatedData = {
            ...data,
            totals: {
              subtotal: data.total || 0,
              kdv: 0,
              total: data.total || 0
            },
            payment: {
              type: 'cash'
            },
            footer: {
              zNo: '',
              ekuNo: '',
              posInfo: '',
              storeCode: '',
              barcode: '',
              irsaliyeText: '',
              signatureText: '',
              thankYouMessage: ''
            }
          };
          
          batch.update(doc.ref, updatedData);
        }
      });

      await batch.commit();
      console.log('Mevcut fişler güncellendi');
    } catch (error: any) {
      console.error('Fişler güncellenirken hata:', error);
      throw new Error('Fişler güncellenirken hata: ' + error.message);
    }
  }

  async migrateLocalReceipts(localReceipts: any[]): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Kullanıcı girişi yapılmamış');

      for (const receipt of localReceipts) {
        const validReceipt = {
          storeName: receipt.storeName || 'Bilinmeyen Market',
          storeAddress: receipt.storeAddress || '',
          vdbNo: receipt.vdbNo || '',
          receiptType: receipt.receiptType || 'FATURA',
          receiptNo: receipt.receiptNo || '',
          date: receipt.date || new Date().toLocaleDateString('tr-TR'),
          time: receipt.time || new Date().toLocaleTimeString('tr-TR'),
          ettn: receipt.ettn || '',
          faturaNo: receipt.faturaNo || '',
          items: Array.isArray(receipt.items) ? receipt.items.map((item: any) => ({
            name: item.name || 'Bilinmeyen Ürün',
            quantity: item.quantity || 1,
            price: item.price || 0,
            taxRate: item.taxRate || 0
          })) : [],
          payment: {
            type: receipt.payment?.type || 'cash',
            bank: receipt.payment?.bank,
            cardInfo: receipt.payment?.cardInfo
          },
          totals: {
            subtotal: receipt.totals?.subtotal || receipt.total || 0,
            kdv: receipt.totals?.kdv || 0,
            total: receipt.totals?.total || receipt.total || 0
          },
          footer: {
            zNo: receipt.footer?.zNo || '',
            ekuNo: receipt.footer?.ekuNo || '',
            posInfo: receipt.footer?.posInfo || '',
            storeCode: receipt.footer?.storeCode || '',
            barcode: receipt.footer?.barcode || '',
            irsaliyeText: receipt.footer?.irsaliyeText || '',
            signatureText: receipt.footer?.signatureText || '',
            thankYouMessage: receipt.footer?.thankYouMessage || ''
          }
        };

        console.log('Taşınacak fiş:', validReceipt);
        await this.addReceipt(validReceipt);
      }
    } catch (error: any) {
      console.error('Fişler taşınırken hata:', error);
      throw new Error('Fişler taşınırken hata: ' + error.message);
    }
  }
}

export default new ReceiptService(); 