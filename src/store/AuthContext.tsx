// src/store/AuthContext.tsx

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import authService from '../services/auth.service';
import { AuthResponse, LoginCredentials } from '../types/database.types';

/**
 * Context de Autenticación
 * Implementa RF02 - Gestión de sesión global
 */

interface AuthContextType {
    user: AuthResponse['user'] | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthResponse['user'] | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Verificar autenticación al montar
     */
    useEffect(() => {
        checkAuth();
    }, []);

    /**
     * Verificar si hay sesión activa
     */
    const checkAuth = async () => {
        try {
            setIsLoading(true);
            const authenticated = await authService.isAuthenticated();

            if (authenticated) {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Check auth error:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Login
     */
    const login = async (credentials: LoginCredentials) => {
        try {
            setIsLoading(true);
            const authData = await authService.login(credentials);
            setUser(authData.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logout
     */
    const logout = async () => {
        try {
            setIsLoading(true);
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook personalizado para usar el contexto
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}