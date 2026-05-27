import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import { authService } from "@/features/auth/services/authService";
import api from "@/shared/utils/axiosInstance";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "creator";
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializaAuth = async () => {
      try {
        await api.post("/auth/refresh");
        const userData = await authService.me();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initializaAuth();
  }, []);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
