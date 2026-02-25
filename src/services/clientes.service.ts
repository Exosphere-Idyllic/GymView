// src/services/clientes.service.ts
// Conectado a: GET /api/clientes/{idUsuario}/dashboard  |  POST /api/clientes/{idUsuario}/completar

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

// Tipos basados en ResumenClienteDTO.java del backend
export interface AsistenciaSimple {
    fecha: string;   // "YYYY-MM-DD"
    hora: string;    // "HH:MM"
}

export interface EjercicioSimple {
    nombre: string;
    seriesReps: string;  // Ej: "4 Series x 12 Reps"
}

export interface ClienteDashboard {
    nombreCompleto: string;
    email: string;
    telefono: string;
    historialAsistencias: AsistenciaSimple[];
    nombreRutina: string | null;
    entrenador: string | null;
    ejercicios: EjercicioSimple[];
    rutinaTerminadaHoy: boolean;
    nombrePlan: string;
    precioPlan: number;
    fechaVencimiento: string | null;
    estadoMembresia: string;   // "Activo" | "Vencido"
}

const clientesService = {
    /**
     * Obtener datos del dashboard del cliente
     * GET /api/clientes/{idUsuario}/dashboard
     *
     * IMPORTANTE: El backend espera id_usuario (de la tabla usuarios),
     * NO el id_cliente de la tabla clientes.
     */
    async getDashboard(idUsuario: number): Promise<ClienteDashboard> {
        return apiClient.get<ClienteDashboard>(
            API_CONFIG.ENDPOINTS.CLIENTES.DASHBOARD(idUsuario)
        );
    },

    /**
     * Marcar rutina como completada hoy
     * POST /api/clientes/{idUsuario}/completar
     */
    async completarRutina(idUsuario: number): Promise<{ mensaje: string }> {
        return apiClient.post(
            API_CONFIG.ENDPOINTS.CLIENTES.COMPLETAR(idUsuario)
        );
    },
};

export default clientesService;