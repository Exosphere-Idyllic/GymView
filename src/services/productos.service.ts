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
    tipo: string;
    stock_actual?: number;
    imagenUrl?: string;
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
     * URL de la imagen del producto (si es una URL de Cloudinary la retorna directamente, si no, usa el backend)
     * GET /productos/{id}/imagen
     */
    getImagenUrl(id: number, imagenUrl?: string): string {
        if (imagenUrl && (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://'))) {
            return imagenUrl;
        }
        return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTOS.IMAGEN(id)}`;
    },

    /**
     * Crear un nuevo producto
     * POST /productos/
     */
    async create(producto: Partial<Producto>): Promise<any> {
        return await apiClient.post(API_CONFIG.ENDPOINTS.PRODUCTOS.BASE, producto);
    },

    /**
     * Actualizar un producto existente
     * PUT /productos/{id}
     */
    async update(idProducto: number, producto: Partial<Producto>): Promise<any> {
        return await apiClient.put(`${API_CONFIG.ENDPOINTS.PRODUCTOS.BASE}/${idProducto}`, producto);
    },

    /**
     * Eliminar un producto
     * DELETE /productos/{id}
     */
    async delete(idProducto: number): Promise<any> {
        return await apiClient.delete(`${API_CONFIG.ENDPOINTS.PRODUCTOS.BASE}/${idProducto}`);
    }
};

export default productosService;
