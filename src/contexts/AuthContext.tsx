import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for each role
const demoUsers: Record<UserRole, User> = {
  sales_clerk: {
    id: '1',
    name: 'Ahmed Hassan',
    email: 'clerk@demo.com',
    role: 'sales_clerk',
  },
  collector: {
    id: '2',
    name: 'Mohamed Ali',
    email: 'collector@demo.com',
    role: 'collector',
  },
  accountant: {
    id: '3',
    name: 'Sara Ahmed',
    email: 'accountant@demo.com',
    role: 'accountant',
  },
  sales_manager: {
    id: '4',
    name: 'Khaled Ibrahim',
    email: 'manager@demo.com',
    role: 'sales_manager',
  },
  admin: {
    id: '5',
    name: 'Admin User',
    email: 'admin@demo.com',
    role: 'admin',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Demo login - find user by email
    const foundUser = Object.values(demoUsers).find(u => u.email === email);
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUser(demoUsers[role]);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
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
