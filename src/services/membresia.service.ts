// src/services/membresia.service.ts
// POST /api/membresias/{idCliente} — Asignar/renovar membresía (RF07)

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

// Planes disponibles — reflejan la tabla membresias del backend
export const PLANES_MEMBRESIA = [
    { id: 1, nombre: 'Smart', precio: 25.00, dias: 30, icon: '🥉' },
    { id: 2, nombre: 'Black', precio: 40.00, dias: 30, icon: '⚫' },
];

const membresiaService = {
    /**
     * Asignar o renovar membresía a un cliente.
     * El backend registra el pago automáticamente y actualiza fecha_vencimiento.
     *
     * POST /api/membresias/{idCliente}
     * Body: { idTipoMembresia: number }
     */
    async asignar(idCliente: number, idTipoMembresia: number): Promise<{ mensaje: string }> {
        return apiClient.post(
            API_CONFIG.ENDPOINTS.MEMBRESIAS.ASIGNAR(idCliente),
            { idTipoMembresia }
        );
    },

    /**
     * Cancelar (eliminar) la membresía actual de un cliente.
     * DELETE /api/membresias/{idCliente}
     */
    async cancelar(idCliente: number): Promise<{ mensaje: string }> {
        return apiClient.delete(
            API_CONFIG.ENDPOINTS.MEMBRESIAS.ASIGNAR(idCliente)
        );
    },
};

export default membresiaService;
