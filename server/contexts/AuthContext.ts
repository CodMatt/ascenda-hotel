import React from 'react';
import { IUser, ILoginRequest, IRegisterRequest } from '../types/auth.types';
import { authService } from '../services/authServices';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  login: (credentials: ILoginRequest) => Promise<void>;
  register: (userData: IRegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context using React.createContext explicitly
const AuthContext = React.createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = React.useState<IUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          authService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: ILoginRequest) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const register = async (userData: IRegisterRequest) => {
    const response = await authService.register(userData);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};