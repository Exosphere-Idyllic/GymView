// src/store/AuthContext.tsx
// Estrategia: intenta API real → fallback a mock si falla

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_USUARIOS } from '../services/mock/mockData';
import authService from '../services/auth.service';

const STORAGE_KEY = 'gymview_user_v2';

export interface AuthUser {
    id_usuario: number;
    usuario: string;
    rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
    nombre_completo: string;
    id_rol: number;
    email?: string | null;
    usandoMock?: boolean;   // Indicador de modo offline
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

    // Restaurar sesión al iniciar
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((data: string | null) => {
                if (data) setUser(JSON.parse(data));
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (credentials: { usuario: string; contrasena: string }) => {
        // ─── INTENTO 1: API REAL ───
        try {
            const response = await authService.login({
                usuario: credentials.usuario,
                contrasena: credentials.contrasena,
            });

            if (!response.activo) {
                throw new Error('Cuenta no verificada. Revisa tu correo.');
            }

            const authUser: AuthUser = {
                id_usuario: response.id_usuario,
                usuario: response.usuario,
                rol: authService.mapRol(response.id_rol),
                nombre_completo: [response.nombre, response.apellido]
                    .filter(Boolean)
                    .join(' ') || response.usuario,
                id_rol: response.id_rol,
                email: response.email,
                usandoMock: false,
            };

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
            setUser(authUser);
            console.log('✅ Login con API real exitoso. id_usuario:', authUser.id_usuario);
            return;

        } catch (apiError: any) {
            console.warn('⚠️ API no disponible, intentando mock...', apiError.message);

            // Si el error es de credenciales (no de red), relanzar
            if (
                apiError.message?.includes('Credenciales') ||
                apiError.message?.includes('verificada') ||
                apiError.message?.includes('401') ||
                apiError.message?.includes('403')
            ) {
                throw apiError;
            }
        }

        // ─── INTENTO 2: MOCK (fallback offline) ───
        const found = MOCK_USUARIOS.find(
            (u) =>
                u.usuario === credentials.usuario &&
                u.contrasena === credentials.contrasena
        );

        if (!found) {
            throw new Error('Usuario o contraseña incorrectos');
        }

        const mockUser: AuthUser = {
            id_usuario: found.id_usuario,
            usuario: found.usuario,
            rol: found.rol as AuthUser['rol'],
            nombre_completo: found.nombre_completo,
            id_rol: found.id_rol,
            usandoMock: true,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
        console.log('ℹ️ Login en modo MOCK (API no disponible)');
    };

    const logout = async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}