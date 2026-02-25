// src/services/api.client.ts
// Cliente HTTP usando fetch nativo - compatible con Expo Web y Mobile

import { API_CONFIG } from '../config/api.config';

class ApiClient {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...options.headers,
                },
            });

            clearTimeout(timer);

            // Intentar parsear como JSON, si falla devolver texto
            const text = await response.text();
            let data: any;
            try {
                data = JSON.parse(text);
            } catch {
                data = { mensaje: text };
            }

            if (!response.ok) {
                throw new Error(data?.mensaje || `Error ${response.status}`);
            }

            return data as T;
        } catch (error: any) {
            clearTimeout(timer);
            if (error.name === 'AbortError') {
                throw new Error('El servidor tardó demasiado. Puede estar iniciando (Render free tier). Intenta en 30 segundos.');
            }
            throw error;
        }
    }

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
}

export default new ApiClient();