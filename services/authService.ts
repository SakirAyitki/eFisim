import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../src/config/firebase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  surname: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    surname: string;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Login attempt:', credentials.email);
      const { user } = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      console.log('Login successful:', user.uid);
      return this.formatUserResponse(user);
    } catch (error: any) {
      console.error('Login error:', error.code, error.message);
      throw this.handleFirebaseError(error);
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Register attempt:', data.email);
      const { user } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      console.log('User created:', user.uid);

      // Kullanıcı profilini güncelle
      await updateProfile(user, {
        displayName: `${data.name} ${data.surname}`
      });

      console.log('Profile updated for:', user.uid);
      return this.formatUserResponse(user);
    } catch (error: any) {
      console.error('Register error:', error.code, error.message);
      throw this.handleFirebaseError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error.code, error.message);
      throw this.handleFirebaseError(error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        console.log('Auth state:', user ? 'authenticated' : 'not authenticated');
        resolve(!!user);
      });
    });
  }

  private formatUserResponse(user: FirebaseUser): AuthResponse {
    const [name = '', surname = ''] = user.displayName?.split(' ') || ['', ''];
    
    return {
      user: {
        id: user.uid,
        email: user.email || '',
        name,
        surname
      }
    };
  }

  private handleFirebaseError(error: any): Error {
    let message = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Bu e-posta adresi zaten kullanımda.';
        break;
      case 'auth/invalid-email':
        message = 'Geçersiz e-posta adresi.';
        break;
      case 'auth/operation-not-allowed':
        message = 'E-posta/şifre girişi etkin değil.';
        break;
      case 'auth/weak-password':
        message = 'Şifre çok zayıf. En az 6 karakter olmalı.';
        break;
      case 'auth/user-disabled':
        message = 'Bu kullanıcı hesabı devre dışı bırakıldı.';
        break;
      case 'auth/user-not-found':
        message = 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı.';
        break;
      case 'auth/wrong-password':
        message = 'Hatalı şifre.';
        break;
      case 'auth/network-request-failed':
        message = 'İnternet bağlantısı hatası.';
        break;
    }

    console.error('Firebase error:', error.code, message);
    return new Error(message);
  }
}

export default new AuthService(); 