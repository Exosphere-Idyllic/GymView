// src/services/auth.service.ts
// Endpoints: AuthController.java en el backend

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

// ─── Tipos de petición ──────────────────────────────────────────────────────

export interface LoginRequest {
    usuario: string;
    contrasena: string;
}

// El backend devuelve { token: string, usuario: { ... } }
export interface LoginResponse {
    token: string;
    usuario: {
        idUsuario: number;
        idRol: number;
        usuario: string;
        activo: boolean;
        email: string | null;
        nombre?: string | null;
        apellido?: string | null;
        id_usuario?: number;
        id_rol?: number;
    }
}

export interface RegistroRequest {
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
    email: string;
    fechaNacimiento: string;  // "YYYY-MM-DD"
    usuario: string;
    contrasena: string;
    idRol?: number;           // Default 4 (cliente)
}

export interface AdminDashboardResponse {
    totalClientes: number;
    totalEntrenadores: number;
    ingresos: number;
}

export interface AdminUsuario {
    id: number;
    usuario: string;
    nombre: string;
    apellido: string;
    rol: string;
    activo: boolean;
    idCliente?: number;       // id en tabla clientes (0 si no tiene perfil cliente)
    membresia?: string;       // nombre del plan actual
    fechaVencimiento?: string | null; // fecha de vencimiento de membresía
    email?: string;
    telefono?: string;
    cedula?: string;
    fechaNacimiento?: string;
    idEntrenador?: number | null;
}

export interface CrearUsuarioAdminRequest {
    idRol: number;
    usuario: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
    cedula?: string;
    fechaNacimiento?: string;
    idEntrenador?: number | null;
}

// ─── Servicio ──────────────────────────────────────────────────────────────

const authService = {

    /**
     * Login con usuario o email + contraseña
     * POST /api/auth/login
     *
     * El backend de Java usa JSON-B (Yasson) que serializa los getters
     * como camelCase (idUsuario, idRol). Normalizamos ambos casos aquí.
     */
    async login(creds: LoginRequest): Promise<{
        id_usuario: number;
        id_rol: number;
        usuario: string;
        activo: boolean;
        email: string | null;
        nombre?: string | null;
        apellido?: string | null;
        token: string;
    }> {
        const raw = await apiClient.post<LoginResponse>(
            API_CONFIG.ENDPOINTS.AUTH.LOGIN,
            creds
        );

        const userData = raw.usuario;

        // Normalizar: JSON-B puede devolver "idUsuario" o "id_usuario"
        return {
            id_usuario: userData.idUsuario ?? userData.id_usuario ?? 0,
            id_rol: userData.idRol ?? userData.id_rol ?? 4,
            usuario: userData.usuario,
            activo: userData.activo,
            email: userData.email ?? null,
            nombre: userData.nombre ?? null,
            apellido: userData.apellido ?? null,
            token: raw.token,
        };
    },


    /**
     * Registro de nuevo cliente (auto-registro con validaciones)
     * POST /api/auth/registro
     */
    async registro(datos: RegistroRequest): Promise<{ mensaje: string; idUsuario: number }> {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTRO, datos);
    },

    /**
     * Verificar cuenta con código enviado al correo
     * POST /api/auth/verificar
     */
    async verificarCuenta(email: string, codigo: string): Promise<{ mensaje: string }> {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFICAR, { email, codigo });
    },

    /**
     * Estadísticas reales del dashboard admin
     * GET /api/auth/admin/dashboard
     */
    async getAdminDashboard(): Promise<AdminDashboardResponse> {
        return apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ADMIN_DASHBOARD);
    },

    /**
     * Lista de usuarios para el panel admin
     * GET /api/auth/admin/usuarios
     */
    async getUsuariosAdmin(): Promise<AdminUsuario[]> {
        const data = await apiClient.get<AdminUsuario[] | any>(
            API_CONFIG.ENDPOINTS.AUTH.ADMIN_USUARIOS
        );
        // El DAO devuelve JSON manual con "id" como clave
        return Array.isArray(data) ? data : [];
    },

    /**
     * Crear usuario desde panel admin
     * POST /api/auth/admin/usuarios
     */
    async crearUsuarioAdmin(datos: CrearUsuarioAdminRequest): Promise<{ mensaje: string }> {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.ADMIN_USUARIOS, datos);
    },

    /**
     * Editar usuario desde panel admin
     * PUT /api/auth/admin/usuarios/{id}
     */
    async editarUsuarioAdmin(
        id: number,
        datos: Partial<CrearUsuarioAdminRequest>
    ): Promise<{ mensaje: string }> {
        return apiClient.put(API_CONFIG.ENDPOINTS.AUTH.ADMIN_USUARIO_ID(id), datos);
    },

    /**
     * Activar / Desactivar usuario (borrado lógico)
     * PUT /api/auth/admin/usuarios/{id}/estado?activo=true|false
     */
    async cambiarEstadoUsuario(id: number, activo: boolean): Promise<{ mensaje: string }> {
        const endpoint = `${API_CONFIG.ENDPOINTS.AUTH.ADMIN_USUARIO_ESTADO(id)}?activo=${activo}`;
        return apiClient.put(endpoint);
    },

    /**
     * Convierte id_rol numérico al string de rol usado en el frontend
     */
    mapRol(idRol: number): 'admin' | 'recepcionista' | 'entrenador' | 'cliente' {
        switch (idRol) {
            case 1: return 'admin';
            case 2: return 'recepcionista';
            case 3: return 'entrenador';
            case 4: return 'cliente';
            default: return 'cliente';
        }
    },
};

export default authService;