import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import { setSessionExpiredHandler } from '../services/api';
import { RegisterData, User } from '../types';

export interface AuthContextType {
  user: User | null;
  /** 起動時のセッション確認中かどうか（ログイン処理中は含まない） */
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCachedUser());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // トークンのリフレッシュにも失敗したら、リロードせずにログイン画面へ戻す
    setSessionExpiredHandler(() => setUser(null));

    if (!authService.hasSession()) {
      setUser(null);
      setIsInitializing(false);
      return;
    }
    authService
      .getProfile()
      .then(setUser)
      .catch(async () => {
        await authService.logout();
        setUser(null);
      })
      .finally(() => setIsInitializing(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authService.login({ email, password });
    setUser(user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const { user } = await authService.register(data);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isInitializing, login, register, logout }),
    [user, isInitializing, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
