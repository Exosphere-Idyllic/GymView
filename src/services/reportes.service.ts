// src/services/reportes.service.ts
// Consumo de los endpoints de reportes administrativos (RF08)

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

export interface ReporteAsistencia {
    fecha: string;               // Ej: "2023-10-15"
    totalAsistencias: number;
    clientesUnicos: number;
}

export interface ReporteIngresos {
    fecha: string;             // Ej: "2023-10" o "2023-10-15"
    totalIngresos: number;     // Suma total
    cantidadVentas: number;    // Conteo
}

export interface ReporteRutinas {
    nombreRutina: string;
    entrenador: string;
    alumnosAsignados: number;
    activa: boolean;
}

const reportesService = {
    /**
     * Obtiene métricas de asistencia
     * GET /api/reportes/asistencia
     */
    async getAsistencia(fechaInicio?: string, fechaFin?: string): Promise<ReporteAsistencia[]> {
        let endpoint = API_CONFIG.ENDPOINTS.REPORTES.ASISTENCIA;
        if (fechaInicio && fechaFin) {
            endpoint += `?inicio=${fechaInicio}&fin=${fechaFin}`;
        }
        return apiClient.get<ReporteAsistencia[]>(endpoint);
    },

    /**
     * Obtiene métricas de ingresos
     * GET /api/reportes/ingresos
     */
    async getIngresos(fechaInicio?: string, fechaFin?: string): Promise<ReporteIngresos[]> {
        let endpoint = API_CONFIG.ENDPOINTS.REPORTES.INGRESOS;
        if (fechaInicio && fechaFin) {
            endpoint += `?inicio=${fechaInicio}&fin=${fechaFin}`;
        }
        return apiClient.get<ReporteIngresos[]>(endpoint);
    },

    /**
     * Obtiene métricas de rutinas
     * GET /api/reportes/rutinas
     */
    async getRutinas(): Promise<ReporteRutinas[]> {
        return apiClient.get<ReporteRutinas[]>(API_CONFIG.ENDPOINTS.REPORTES.RUTINAS);
    }
};

export default reportesService;
