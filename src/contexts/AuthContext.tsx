import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { authApi, clearTokens, getAccessToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend role to frontend role
const mapRole = (backendRole: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'SALES_CLERK': 'sales_clerk',
    'COLLECTOR': 'collector',
    'ACCOUNTANT': 'accountant',
    'SALES_MANAGER': 'sales_manager',
    'ADMIN': 'admin',
  };
  return roleMap[backendRole] || 'sales_clerk';
};

// Map backend user to frontend user
const mapUser = (backendUser: any): User => ({
  id: backendUser.id,
  name: backendUser.name,
  email: backendUser.email,
  role: mapRole(backendUser.role),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.data) {
            setUser(mapUser(response.data));
          }
        } catch (error) {
          // Token invalid or expired
          clearTokens();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      if (response.data?.user) {
        setUser(mapUser(response.data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    }
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    // This is for demo purposes - in production, users would need to re-authenticate
    // For now, we keep it for easy testing
    if (user) {
      setUser({ ...user, role });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      switchRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
