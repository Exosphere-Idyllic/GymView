// src/store/AuthContext.tsx
// Estrategia: intenta API real → fallback a mock si es error de RED (no de credenciales)

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
    usandoMock?: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { usuario: string; contrasena: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Errores que provienen del backend (no de red) ────────────────────────────
// Si el backend responde con estos mensajes, NO hacemos fallback a mock.
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
    return BACKEND_AUTH_ERRORS.some(k => lower.includes(k));
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
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (credentials: { usuario: string; contrasena: string }) => {

        // ─── INTENTO 1: API REAL ───────────────────────────────────────────────
        try {
            console.log('[Auth] Intentando login con API real...');
            const response = await authService.login({
                usuario: credentials.usuario,
                contrasena: credentials.contrasena,
            });

            if (!response.activo) {
                // El backend respondió pero la cuenta no está verificada → NO ir a mock
                throw new Error('Cuenta no verificada. Revisa tu correo y confirma tu cuenta.');
            }

            const authUser: AuthUser = {
                id_usuario: response.id_usuario,
                usuario: response.usuario,
                rol: authService.mapRol(response.id_rol),
                nombre_completo:
                    [response.nombre, response.apellido].filter(Boolean).join(' ') ||
                    response.usuario,
                id_rol: response.id_rol,
                email: response.email,
                usandoMock: false,
            };

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
            setUser(authUser);
            console.log(`[Auth] ✅ Login API real OK — usuario: ${authUser.usuario} | rol: ${authUser.rol} | id: ${authUser.id_usuario}`);
            return;

        } catch (apiError: any) {
            const msg: string = apiError?.message || '';
            console.warn('[Auth] API error:', msg);

            // Si el error vino del backend (credenciales malas, cuenta bloqueada, etc.)
            // NO caemos al mock — relanzamos el error para que la UI lo muestre.
            if (isAuthError(msg)) {
                throw new Error(msg || 'Credenciales incorrectas');
            }

            // Si es error de red / timeout → avisamos y caemos al mock
            console.warn('[Auth] Error de red — usando modo MOCK (offline)');
        }

        // ─── INTENTO 2: MOCK (solo si la API no responde por red) ─────────────
        const found = MOCK_USUARIOS.find(
            u =>
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
        console.log('[Auth] ℹ️ Login MOCK (sin conexión al servidor)');
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
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
}