import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, getErrorMessage } from '../services/api';
import { IUser } from '../types';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalReason: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string, targetRole?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  openAuthModal: (reason?: string, onComplete?: () => void) => void;
  closeAuthModal: () => void;
  saveGuestDraft: (key: string, data: any) => void;
  getGuestDraft: <T>(key: string, defaultValue: T) => T;
  clearGuestDraft: (key: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const stored = localStorage.getItem('s2h_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('s2h_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string>('Create a free account to sync across devices');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Initialize and check token profile on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('s2h_auth_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/profile');
          if (res.data?.success && res.data?.data) {
            const userData: IUser = {
              id: res.data.data._id || res.data.data.id,
              fullName: res.data.data.fullName,
              email: res.data.data.email,
              targetRole: res.data.data.targetRole,
              skills: res.data.data.skills || []
            };
            setUser(userData);
            localStorage.setItem('s2h_user_profile', JSON.stringify(userData));
          }
        } catch {
          // If server is unavailable but local user exists, keep offline session
          const storedUser = localStorage.getItem('s2h_user_profile');
          if (!storedUser) {
            localStorage.removeItem('s2h_auth_token');
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success && res.data?.data?.token) {
        const receivedToken = res.data.data.token;
        const receivedUser = res.data.data.user;

        const userData: IUser = {
          id: receivedUser.id || receivedUser._id,
          fullName: receivedUser.fullName,
          email: receivedUser.email,
          targetRole: receivedUser.targetRole,
          skills: receivedUser.skills || []
        };

        localStorage.setItem('s2h_auth_token', receivedToken);
        localStorage.setItem('s2h_user_profile', JSON.stringify(userData));
        setToken(receivedToken);
        setUser(userData);

        setIsAuthModalOpen(false);

        if (pendingCallback) {
          setTimeout(() => {
            pendingCallback();
            setPendingCallback(null);
          }, 150);
        }

        return { success: true };
      }
      return { success: false, error: 'Failed to authenticate.' };
    } catch (error: any) {
      // Offline fallback
      if (!error.response) {
        const localUser: IUser = {
          id: `offline_${Date.now()}`,
          fullName: email.split('@')[0],
          email: email.trim(),
          targetRole: 'Software Engineer',
          skills: []
        };
        const localToken = `s2h_offline_${Date.now()}`;
        localStorage.setItem('s2h_auth_token', localToken);
        localStorage.setItem('s2h_user_profile', JSON.stringify(localUser));
        setToken(localToken);
        setUser(localUser);
        setIsAuthModalOpen(false);
        if (pendingCallback) {
          setTimeout(() => {
            pendingCallback();
            setPendingCallback(null);
          }, 150);
        }
        return { success: true };
      }
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const register = async (fullName: string, email: string, password: string, targetRole?: string) => {
    try {
      const res = await api.post('/auth/register', {
        fullName,
        email,
        password,
        targetRole: targetRole || 'Software Engineer'
      });

      if (res.data?.success && res.data?.data?.token) {
        const receivedToken = res.data.data.token;
        const receivedUser = res.data.data.user;

        const userData: IUser = {
          id: receivedUser.id || receivedUser._id,
          fullName: receivedUser.fullName,
          email: receivedUser.email,
          targetRole: receivedUser.targetRole,
          skills: receivedUser.skills || []
        };

        localStorage.setItem('s2h_auth_token', receivedToken);
        localStorage.setItem('s2h_user_profile', JSON.stringify(userData));
        setToken(receivedToken);
        setUser(userData);

        setIsAuthModalOpen(false);

        if (pendingCallback) {
          setTimeout(() => {
            pendingCallback();
            setPendingCallback(null);
          }, 150);
        }

        return { success: true };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (error: any) {
      // Offline fallback
      if (!error.response) {
        const localUser: IUser = {
          id: `offline_${Date.now()}`,
          fullName: fullName.trim(),
          email: email.trim(),
          targetRole: targetRole || 'Software Engineer',
          skills: []
        };
        const localToken = `s2h_offline_${Date.now()}`;
        localStorage.setItem('s2h_auth_token', localToken);
        localStorage.setItem('s2h_user_profile', JSON.stringify(localUser));
        setToken(localToken);
        setUser(localUser);
        setIsAuthModalOpen(false);
        if (pendingCallback) {
          setTimeout(() => {
            pendingCallback();
            setPendingCallback(null);
          }, 150);
        }
        return { success: true };
      }
      return { success: false, error: getErrorMessage(error) };
    }
  };

  const logout = () => {
    localStorage.removeItem('s2h_auth_token');
    localStorage.removeItem('s2h_user_profile');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (reason = 'Create a free account to continue', onComplete?: () => void) => {
    setAuthModalReason(reason);
    if (onComplete) {
      setPendingCallback(() => onComplete);
    } else {
      setPendingCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  // Guest State Helpers
  const saveGuestDraft = (key: string, data: any) => {
    try {
      localStorage.setItem(`s2h_guest_${key}`, JSON.stringify(data));
    } catch {
      console.warn('Failed to persist draft in localStorage');
    }
  };

  const getGuestDraft = <T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(`s2h_guest_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const clearGuestDraft = (key: string) => {
    localStorage.removeItem(`s2h_guest_${key}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isAuthModalOpen,
        authModalReason,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        saveGuestDraft,
        getGuestDraft,
        clearGuestDraft
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
