import { createContext, useState, useEffect, type ReactNode, useContext } from 'react';
import { authService } from '@/features/auth/services/authService';

interface User {
  id: number; // ✅ number, no string — así viene del backend
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'creator';
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;  // ✅ sin token — va en cookie
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ evita flash de login

  useEffect(() => {
    // Al recargar la página, verifica si hay sesión activa via cookie
    authService.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = (user: User) => {
    setUser(user);
    // ✅ sin localStorage — la cookie httpOnly persiste sola
  };

  const logout = async () => {
    await authService.logout(); // limpia cookies en el servidor
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}