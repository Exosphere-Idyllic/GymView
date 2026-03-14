// src/services/pagos.service.ts
// GET /api/pagos — Historial de todos los pagos (admin)

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

export interface Pago {
    idPago: number;
    idCliente: number;
    nombreCliente: string;
    apellidoCliente: string;
    fechaPago: string;      // "YYYY-MM-DD" o ISO datetime
    monto: number;
    metodoPago?: string;
    observaciones?: string;
    idFactura?: number;
}

const pagosService = {
    /**
     * Historial completo de pagos - solo admin
     * GET /api/pagos
     */
    async getAll(): Promise<Pago[]> {
        const data = await apiClient.get<Pago[] | any>(API_CONFIG.ENDPOINTS.PAGOS.BASE);
        return Array.isArray(data) ? data : [];
    },

    /**
     * Obtener el comprobante (factura) de un pago.
     * GET /api/ventas/{idFactura}/comprobante
     */
    async getComprobante(idFactura: number): Promise<any> {
        // Aprovechamos el apiClient pero vamos a la ruta de ventas
        return await apiClient.get<any>(`/ventas/${idFactura}/comprobante`);
    }
};

export default pagosService;
