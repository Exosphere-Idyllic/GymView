// src/services/entrenadores.service.ts
// Conectado a EntrenadorController.java del backend

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

// ─── Tipos (basados en EntrenadorDashboardDTO.java y NuevaRutinaDTO.java) ───

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

/**
 * DTO para crear/editar una rutina.
 * Los campos deben coincidir exactamente con NuevaRutinaDTO.java:
 *   public int idCliente;
 *   public String nombreRutina;
 *   public List<Integer> idsEjercicios;
 */
export interface NuevaRutina {
    idCliente: number;
    nombreRutina: string;
    idsEjercicios: number[];
}

// Alias para compatibilidad con código existente que lo importa como NuevaRutinaDTO
export type NuevaRutinaDTO = NuevaRutina;

// ─── Servicio ──────────────────────────────────────────────────────────────

const entrenadoresService = {

    /**
     * Dashboard del entrenador: alumnos, stats y biblioteca de rutinas
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
    async crearRutina(idUsuario: number, datos: NuevaRutina): Promise<{ mensaje: string }> {
        return apiClient.post(
            API_CONFIG.ENDPOINTS.ENTRENADORES.CREAR_RUTINA(idUsuario),
            datos
        );
    },

    /**
     * Agenda del día (alumnos con rutinas activas hoy)
     * GET /api/entrenadores/{idUsuario}/agenda
     */
    async getAgenda(idUsuario: number): Promise<AlumnoResumen[]> {
        return apiClient.get<AlumnoResumen[]>(
            API_CONFIG.ENDPOINTS.ENTRENADORES.AGENDA(idUsuario)
        );
    },

    /**
     * Editar rutina existente (reemplaza todos los ejercicios)
     * PUT /api/entrenadores/rutinas/{idRutina}
     */
    async editarRutina(idRutina: number, datos: NuevaRutina): Promise<{ mensaje: string }> {
        return apiClient.put(
            API_CONFIG.ENDPOINTS.ENTRENADORES.RUTINA_ID(idRutina),
            datos
        );
    },

    /**
     * Borrado lógico de rutina (activa = false)
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

    /**
     * Asignar rutina plantilla a un cliente (duplica la rutina y la asocia)
     * POST /api/entrenadores/rutinas/{idRutinaTemplate}/asignar/{idClienteTarget}
     */
    async asignarRutina(idRutinaTemplate: number, idClienteTarget: number): Promise<{ mensaje: string }> {
        return apiClient.post(
            API_CONFIG.ENDPOINTS.ENTRENADORES.ASIGNAR_RUTINA(idRutinaTemplate, idClienteTarget)
        );
    }
};

export default entrenadoresService;