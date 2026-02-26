// src/services/productos.service.ts
// Endpoints: GET /productos, GET /productos/{id}/imagen

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

export interface Producto {
    idProducto?: number;
    id?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    tipo: 'venta' | 'uso';
    stock_actual?: number;
}

const productosService = {
    /**
     * Listar todos los productos
     * GET /productos/
     */
    async listar(): Promise<Producto[]> {
        const data = await apiClient.get<Producto[]>(API_CONFIG.ENDPOINTS.PRODUCTOS.BASE);
        return Array.isArray(data) ? data : [];
    },

    /**
     * URL de la imagen del producto (el backend sirve la imagen en este endpoint)
     * GET /productos/{id}/imagen
     */
    getImagenUrl(id: number): string {
        return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTOS.IMAGEN(id)}`;
    },
};

export default productosService;
