import { createContext, useContext, useState, useEffect } from 'react';
import { api, tokenStorage } from '../services/api';
import { User, WorkerProfile, UserRole } from '../types/index';

interface AuthContextType {
  user: User | null;
  workerProfile: WorkerProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isWorker: boolean;
  requestOTP: (phoneNumber: string) => Promise<{ success: boolean; devOtp?: string }>;
  verifyOTP: (
    phoneNumber: string,
    otpCode: string,
    role?: 'CLIENT' | 'WORKER',
    fullName?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setRoleMode: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = await tokenStorage.get();
      if (!token) {
        setUser(null);
        setWorkerProfile(null);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setWorkerProfile(data.workerProfile || null);
    } catch {
      await tokenStorage.remove();
      setUser(null);
      setWorkerProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const requestOTP = async (phoneNumber: string) => {
    return api.requestOTP(phoneNumber);
  };

  const verifyOTP = async (
    phoneNumber: string,
    otpCode: string,
    role: 'CLIENT' | 'WORKER' = 'CLIENT',
    fullName?: string
  ) => {
    setIsLoading(true);
    try {
      const data = await api.verifyOTP({ phoneNumber, otpCode, role, fullName });
      setUser(data.user);
      setWorkerProfile(data.workerProfile || null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setWorkerProfile(null);
      setIsLoading(false);
    }
  };

  const setRoleMode = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const isWorker = user?.role === 'WORKER';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        workerProfile,
        isLoading,
        isAuthenticated,
        isWorker,
        requestOTP,
        verifyOTP,
        logout,
        refreshUser,
        setRoleMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
