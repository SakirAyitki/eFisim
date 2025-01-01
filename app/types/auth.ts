import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  surname: z.string().min(2, 'Soyisim en az 2 karakter olmalıdır'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  surname: string;
} 