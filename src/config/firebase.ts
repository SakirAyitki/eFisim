import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPgVOPscPGNqrHyDbCapqPyxdIYONiTjY",
  authDomain: "efisim-qr.firebaseapp.com",
  projectId: "efisim-qr",
  storageBucket: "efisim-qr.firebasestorage.app",
  messagingSenderId: "720277887857",
  appId: "1:720277887857:web:f2f56560fb99f0f3e7b4d0"
};

// Firebase'i başlat (eğer zaten başlatılmamışsa)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Servisleri al
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 