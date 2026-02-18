// src/services/auth.service.ts

import apiClient from './api.client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';
import {
    LoginCredentials,
    AuthResponse,
    Usuario,
    ApiResponse,
} from '../types/database.types';

/**
 * Servicio de Autenticación
 * Implementa RF02 - Autenticación y Autorización
 */

class AuthService {
    /**
     * Login de usuario
     * POST /api/auth/login
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>(
                API_CONFIG.ENDPOINTS.AUTH.LOGIN,
                credentials
            );

            if (response.success && response.data) {
                // Guardar tokens en AsyncStorage
                await this.saveAuthData(response.data);
                return response.data;
            }

            throw new Error(response.message || 'Error en login');
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(
                error.response?.data?.message || 'Credenciales inválidas'
            );
        }
    }

    /**
     * Registro de nuevo usuario
     * POST /api/auth/register
     */
    async register(userData: {
        usuario: string;
        contrasena: string;
        email: string;
        id_rol: number;
    }): Promise<ApiResponse<Usuario>> {
        try {
            const response = await apiClient.post<ApiResponse<Usuario>>(
                API_CONFIG.ENDPOINTS.AUTH.REGISTER,
                userData
            );
            return response;
        } catch (error: any) {
            console.error('Register error:', error);
            throw new Error(
                error.response?.data?.message || 'Error al registrar usuario'
            );
        }
    }

    /**
     * Logout - Limpiar tokens y datos locales
     */
    async logout(): Promise<void> {
        try {
            // Llamar endpoint de logout si existe
            await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Limpiar storage local
            await this.clearAuthData();
        }
    }

    /**
     * Refrescar token de acceso
     */
    async refreshToken(): Promise<string> {
        const refreshToken = await AsyncStorage.getItem('refresh_token');

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await apiClient.post<ApiResponse<{ access_token: string }>>(
            API_CONFIG.ENDPOINTS.AUTH.REFRESH,
            { refreshToken }
        );

        if (response.success && response.data) {
            await AsyncStorage.setItem('access_token', response.data.access_token);
            return response.data.access_token;
        }

        throw new Error('Failed to refresh token');
    }

    /**
     * Verificar si el usuario está autenticado
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await AsyncStorage.getItem('access_token');
        return !!token;
    }

    /**
     * Obtener usuario actual desde storage
     */
    async getCurrentUser(): Promise<AuthResponse['user'] | null> {
        try {
            const userJson = await AsyncStorage.getItem('user');
            return userJson ? JSON.parse(userJson) : null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Obtener token de acceso
     */
    async getAccessToken(): Promise<string | null> {
        return await AsyncStorage.getItem('access_token');
    }

    /**
     * Verificar código de verificación (2FA o email)
     */
    async verifyCode(
        id_usuario: number,
        codigo: string
    ): Promise<ApiResponse<boolean>> {
        return await apiClient.post<ApiResponse<boolean>>(
            API_CONFIG.ENDPOINTS.AUTH.VERIFY_CODE,
            { id_usuario, codigo }
        );
    }

    /**
     * Cambiar contraseña
     */
    async changePassword(
        id_usuario: number,
        contrasenaActual: string,
        contrasenaNueva: string
    ): Promise<ApiResponse<boolean>> {
        return await apiClient.put<ApiResponse<boolean>>(
            `/usuarios/${id_usuario}/password`,
            { contrasenaActual, contrasenaNueva }
        );
    }

    /**
     * Solicitar restablecimiento de contraseña
     */
    async requestPasswordReset(email: string): Promise<ApiResponse<boolean>> {
        return await apiClient.post<ApiResponse<boolean>>(
            '/auth/request-reset',
            { email }
        );
    }

    /**
     * Restablecer contraseña con código
     */
    async resetPassword(
        codigo: string,
        contrasenaNueva: string
    ): Promise<ApiResponse<boolean>> {
        return await apiClient.post<ApiResponse<boolean>>('/auth/reset-password', {
            codigo,
            contrasenaNueva,
        });
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Guardar datos de autenticación en AsyncStorage
     */
    private async saveAuthData(authData: AuthResponse): Promise<void> {
        await AsyncStorage.multiSet([
            ['access_token', authData.access_token],
            ['refresh_token', authData.refresh_token],
            ['user', JSON.stringify(authData.user)],
        ]);
    }

    /**
     * Limpiar datos de autenticación
     */
    private async clearAuthData(): Promise<void> {
        await AsyncStorage.multiRemove([
            'access_token',
            'refresh_token',
            'user',
        ]);
    }
}

export default new AuthService();