// src/services/entrenadores.service.ts
// Conectado a los endpoints de EntrenadorController.java

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

// Basado en EntrenadorDashboardDTO.java
export interface AlumnoResumen {
    idCliente: number;
    nombre: string;
    plan: string;
    rutina: string;
    terminoHoy: boolean;
}

export interface RutinaItem {
    id: number;
    nombre: string;
    activa: boolean;
    idCliente: number;
    idsEjercicios: number[];
}

export interface EntrenadorDashboard {
    nombre: string;
    especialidad: string;
    rutinasCreadas: number;
    totalAlumnos: number;
    listaAlumnos: AlumnoResumen[];
    listaRutinas: RutinaItem[];
}

// Basado en NuevaRutinaDTO.java
export interface NuevaRutinaDTO {
    idCliente: number;
    nombreRutina: string;
    idsEjercicios: number[];
}

const entrenadoresService = {
    /**
     * Dashboard del entrenador con alumnos y rutinas
     * GET /api/entrenadores/{idUsuario}/dashboard
     */
    async getDashboard(idUsuario: number): Promise<EntrenadorDashboard> {
        return apiClient.get<EntrenadorDashboard>(
            API_CONFIG.ENDPOINTS.ENTRENADORES.DASHBOARD(idUsuario)
        );
    },

    /**
     * Crear nueva rutina para un alumno
     * POST /api/entrenadores/{idUsuario}/crearRutina
     */
    async crearRutina(idUsuario: number, datos: NuevaRutinaDTO): Promise<{ mensaje: string }> {
        return apiClient.post(
            API_CONFIG.ENDPOINTS.ENTRENADORES.CREAR_RUTINA(idUsuario),
            datos
        );
    },

    /**
     * Ver agenda del día
     * GET /api/entrenadores/{idUsuario}/agenda
     */
    async getAgenda(idUsuario: number): Promise<AlumnoResumen[]> {
        return apiClient.get<AlumnoResumen[]>(
            API_CONFIG.ENDPOINTS.ENTRENADORES.AGENDA(idUsuario)
        );
    },

    /**
     * Editar una rutina existente
     * PUT /api/entrenadores/rutinas/{idRutina}
     */
    async editarRutina(idRutina: number, datos: NuevaRutinaDTO): Promise<{ mensaje: string }> {
        return apiClient.put(
            API_CONFIG.ENDPOINTS.ENTRENADORES.RUTINA_ID(idRutina),
            datos
        );
    },

    /**
     * Desactivar/eliminar rutina (borrado lógico)
     * DELETE /api/entrenadores/rutinas/{idRutina}
     */
    async eliminarRutina(idRutina: number): Promise<{ mensaje: string }> {
        return apiClient.delete(
            API_CONFIG.ENDPOINTS.ENTRENADORES.RUTINA_ID(idRutina)
        );
    },

    /**
     * Reactivar rutina previamente desactivada
     * PUT /api/entrenadores/rutinas/{idRutina}/reactivar
     */
    async reactivarRutina(idRutina: number): Promise<{ mensaje: string }> {
        return apiClient.put(
            API_CONFIG.ENDPOINTS.ENTRENADORES.RUTINA_REACTIVAR(idRutina)
        );
    },
};

export default entrenadoresService;