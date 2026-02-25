// src/services/asistencia.service.ts
// Conectado a: POST /api/accesos/escanear/{idUsuario}

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

export interface AccesoResponse {
    mensaje: string;    // Ej: "🚀 ¡Bienvenido, Juan!" o "👋 ¡Hasta luego, Juan!"
    tipo: 'ENTRADA' | 'SALIDA';
}

const asistenciaService = {
    /**
     * Procesar entrada/salida mediante QR
     * POST /api/accesos/escanear/{idUsuario}
     *
     * Lógica del backend (AsistenciaController.java):
     * - Si no hay entrada hoy → registra ENTRADA
     * - Si ya entró pero no salió → registra SALIDA
     *
     * IMPORTANTE: El backend recibe id_usuario (no id_cliente).
     * El backend internamente traduce id_usuario → id_cliente.
     */
    async escanear(idUsuario: number): Promise<AccesoResponse> {
        return apiClient.post<AccesoResponse>(
            API_CONFIG.ENDPOINTS.ACCESOS.ESCANEAR(idUsuario)
        );
    },
};

export default asistenciaService;