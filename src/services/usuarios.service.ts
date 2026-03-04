// src/services/usuarios.service.ts
// Endpoints: GET/POST /usuarios, GET/PUT/DELETE /usuarios/{id}

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

export interface Usuario {
    id?: number;
    idUsuario?: number;
    usuario: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    activo?: boolean;
    idRol?: number;
    rol?: string;
}

export interface CrearUsuarioRequest {
    idRol: number;
    usuario: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    email?: string;
}

export interface ActualizarUsuarioRequest {
    id?: number;
    usuario?: string;
    contrasena?: string;
    nombre?: string;
    apellido?: string;
    email?: string;
}

const usuariosService = {
    /**
     * Listar todos los usuarios
     * GET /usuarios/
     */
    async listar(): Promise<Usuario[]> {
        const data = await apiClient.get<Usuario[] | any>(API_CONFIG.ENDPOINTS.USUARIOS.BASE);
        return Array.isArray(data) ? data : [];
    },

    /**
     * Obtener usuario por ID
     * GET /usuarios/{id}
     */
    async obtenerPorId(id: number): Promise<Usuario> {
        return apiClient.get<Usuario>(API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(id));
    },

    /**
     * Crear usuario
     * POST /usuarios/
     */
    async crear(datos: CrearUsuarioRequest): Promise<{ mensaje: string; id?: number }> {
        return apiClient.post(API_CONFIG.ENDPOINTS.USUARIOS.BASE, datos);
    },

    /**
     * Actualizar usuario
     * PUT /usuarios/ (con id en body según backend)
     */
    async actualizar(id: number, datos: ActualizarUsuarioRequest): Promise<{ mensaje: string }> {
        return apiClient.put(API_CONFIG.ENDPOINTS.USUARIOS.BASE, { ...datos, id });
    },

    /**
     * Eliminar usuario
     * DELETE /usuarios/{id}
     */
    async eliminar(id: number): Promise<{ mensaje: string }> {
        return apiClient.delete(API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(id));
    },
};

export default usuariosService;
