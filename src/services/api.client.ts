// src/services/api.client.ts
// Cliente HTTP usando fetch nativo — compatible con Expo Web y Mobile
// Incluye: retry automático, detección de cold start de Render, logs de debug

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';

const DEBUG = true; // Cambiar a false en producción

function log(...args: any[]) {
    if (DEBUG) console.log('[ApiClient]', ...args);
}

class ApiClient {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    // ─── Petición base con timeout y retry ────────────────────────────────────
    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        retryCount = 0
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        // Recuperar JWT del almacenamiento seguro
        const token = await AsyncStorage.getItem('gymview_token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        log(`${options.method || 'GET'} ${url}`);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers,
            });

            clearTimeout(timer);

            // Intentar parsear como JSON; si falla, devolver texto plano
            const text = await response.text();
            let data: any;
            try {
                data = JSON.parse(text);
            } catch {
                data = { mensaje: text };
            }

            log(`Response ${response.status}:`, data);

            if (!response.ok) {
                const msg = data?.mensaje || data?.message || `Error ${response.status}`;
                throw new Error(msg);
            }

            return data as T;

        } catch (error: any) {
            clearTimeout(timer);

            // ── Timeout / red caída ───────────────────────────────────────────
            if (error.name === 'AbortError') {
                // Render free tier: reintentar UNA vez con mensaje claro
                if (retryCount === 0) {
                    log('Timeout — reintentando (puede ser cold start de Render)...');
                    return this.request<T>(endpoint, options, 1);
                }
                throw new Error(
                    'El servidor tardó demasiado. Es posible que esté iniciando (Render free tier). ' +
                    'Espera 30 segundos y vuelve a intentarlo.'
                );
            }

            // ── Error de red (sin internet, CORS, etc.) ───────────────────────
            if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
                throw new Error(
                    'No se pudo conectar al servidor. Verifica tu conexión a internet.'
                );
            }

            throw error;
        }
    }

    // ─── Métodos públicos ──────────────────────────────────────────────────────

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // ─── Utilidad: "despertar" el servidor de Render ──────────────────────────
    /**
     * Llama a /prueba para despertar el servidor antes de las peticiones reales.
     * Úsalo en el splash screen de la app.
     */
    async ping(): Promise<boolean> {
        try {
            const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.PRUEBA}`;
            const response = await fetch(url, { method: 'GET' });
            // Cualquier respuesta del servidor (incluso 401) significa que el servidor está despierto
            log(`✅ Servidor activo (respondió HTTP ${response.status})`);
            return true;
        } catch (err) {
            // Error de red o timeout
            log('⚠️ Servidor no responde (cold start probable)');
            return false;
        }
    }
}

export default new ApiClient();