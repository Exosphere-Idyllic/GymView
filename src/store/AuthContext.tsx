// src/store/AuthContext.tsx
// Estrategia: intenta API real → fallback a mock si es error de RED (no de credenciales)

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/auth.service';

const STORAGE_KEY = 'gymview_user_v2';

export interface AuthUser {
    id_usuario: number;
    usuario: string;
    rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
    nombre_completo: string;
    id_rol: number;
    email?: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { usuario: string; contrasena: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (partial: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Errores que provienen del backend (no de red) ────────────────────────────
// Si el backend responde con estos mensajes, relanzamos el error en vez de error genérico.
const BACKEND_AUTH_ERRORS = [
    'credenciales',
    'verificada',
    'no verificada',
    'usuario',
    'contraseña',
    '401',
    '403',
    'incorrect',
    'not found',
];

function isAuthError(message: string): boolean {
    const lower = message.toLowerCase();
    return BACKEND_AUTH_ERRORS.some((k: string) => lower.includes(k));
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restaurar sesión al iniciar
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((data: string | null) => {
                if (data) setUser(JSON.parse(data));
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (credentials: { usuario: string; contrasena: string }) => {
        try {
            console.log('[Auth] Intentando login con API real...');
            const response = await authService.login({
                usuario: credentials.usuario,
                contrasena: credentials.contrasena,
            });

            if (!response.activo) {
                // Cuenta no verificada
                throw new Error('Cuenta no verificada. Revisa tu correo y confirma tu cuenta.');
            }

            const authUser: AuthUser = {
                id_usuario: response.id_usuario,
                usuario: response.usuario,
                rol: authService.mapRol(response.id_rol),
                nombre_completo: [response.nombre, response.apellido].filter(Boolean).join(' ') || response.usuario,
                id_rol: response.id_rol,
                email: response.email,
            };

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
            await AsyncStorage.setItem('gymview_token', response.token);

            setUser(authUser);
            console.log(`[Auth] ✅ Login API real OK — usuario: ${authUser.usuario} | rol: ${authUser.rol} | id: ${authUser.id_usuario}`);
            
        } catch (apiError: any) {
            const msg: string = apiError?.message || 'Error de conexión al servidor. Inténtalo más tarde.';
            console.warn('[Auth] API error:', msg);
            throw new Error(msg);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUser(null);
    };

    const updateUser = async (partial: Partial<AuthUser>) => {
        if (!user) return;
        const next = { ...user, ...partial };
        setUser(next);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
}