// src/services/ventas.service.ts
// Endpoint: POST /ventas — Procesar venta

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

export interface ItemVenta {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
}

export interface ProcesarVentaRequest {
    idUsuario: number;
    total: number;
    productos: ItemVenta[];
}

const ventasService = {
    /**
     * Procesar una venta
     * POST /ventas/
     */
    async procesar(datos: ProcesarVentaRequest): Promise<{ mensaje: string; idVenta?: number }> {
        return apiClient.post(API_CONFIG.ENDPOINTS.VENTAS.BASE, datos);
    },
};

export default ventasService;
