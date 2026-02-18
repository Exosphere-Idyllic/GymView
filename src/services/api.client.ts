// src/services/api.client.ts

import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api.config';

/**
 * Cliente HTTP centralizado para todas las peticiones API
 * Maneja autenticación, interceptors, errores, reintentos
 */

class ApiClient {
    private axiosInstance: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    }> = [];

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: API_CONFIG.HEADERS,
        });

        this.setupInterceptors();
    }

    /**
     * Configurar interceptors de request y response
     */
    private setupInterceptors(): void {
        // Request interceptor: agregar token
        this.axiosInstance.interceptors.request.use(
            async (config) => {
                const token = await AsyncStorage.getItem('access_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor: manejar errores y refresh token
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfig & {
                    _retry?: boolean;
                };

                // Si es error 401 y no hemos reintentado
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        // Si ya estamos refrescando, encolar esta petición
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then((token) => {
                                if (originalRequest.headers) {
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                }
                                return this.axiosInstance(originalRequest);
                            })
                            .catch((err) => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const refreshToken = await AsyncStorage.getItem('refresh_token');
                        const response = await this.axiosInstance.post(
                            API_CONFIG.ENDPOINTS.AUTH.REFRESH,
                            { refreshToken }
                        );

                        const { access_token } = response.data;
                        await AsyncStorage.setItem('access_token', access_token);

                        // Procesar cola de peticiones fallidas
                        this.failedQueue.forEach((prom) => prom.resolve(access_token));
                        this.failedQueue = [];

                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${access_token}`;
                        }
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.failedQueue.forEach((prom) => prom.reject(refreshError));
                        this.failedQueue = [];

                        // Limpiar storage y redirigir a login
                        await AsyncStorage.multiRemove([
                            'access_token',
                            'refresh_token',
                            'user',
                        ]);

                        // Aquí deberías navegar a login
                        // navigation.navigate('Login');

                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Métodos HTTP genéricos
     */
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.get(
            url,
            config
        );
        return response.data;
    }

    async post<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.post(
            url,
            data,
            config
        );
        return response.data;
    }

    async put<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.put(
            url,
            data,
            config
        );
        return response.data;
    }

    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.delete(
            url,
            config
        );
        return response.data;
    }

    async patch<T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.patch(
            url,
            data,
            config
        );
        return response.data;
    }

    /**
     * Método para subir archivos con FormData
     */
    async upload<T = any>(
        url: string,
        formData: FormData,
        onUploadProgress?: (progressEvent: any) => void
    ): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.post(
            url,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            }
        );
        return response.data;
    }
}

export default new ApiClient();