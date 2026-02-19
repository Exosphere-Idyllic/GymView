// src/store/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USUARIOS } from '../services/mock/mockData';

export interface AuthUser {
  id_usuario: number;
  usuario: string;
  rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
  nombre_completo: string;
  id_rol: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { usuario: string; contrasena: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('gymview_user')
      .then((data: string | null) => {
        if (data) setUser(JSON.parse(data));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (credentials: { usuario: string; contrasena: string }) => {
    const found = MOCK_USUARIOS.find(
      (u) => u.usuario === credentials.usuario && u.contrasena === credentials.contrasena
    );
    if (!found) throw new Error('Usuario o contraseña incorrectos');
    const authUser: AuthUser = {
      id_usuario: found.id_usuario,
      usuario: found.usuario,
      rol: found.rol as AuthUser['rol'],
      nombre_completo: found.nombre_completo,
      id_rol: found.id_rol,
    };
    await AsyncStorage.setItem('gymview_user', JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('gymview_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
