// src/services/auth.service.ts
// Conectado a: POST /api/auth/login  |  POST /api/auth/registro  |  POST /api/auth/verificar

import apiClient from './api.client';
import { API_CONFIG } from '../config/api.config';

export interface LoginRequest {
    usuario: string;
    contrasena: string;
}

// Respuesta real del backend: AuthController.java -> UsuarioDAO.login()
export interface LoginResponse {
    id_usuario: number;
    id_rol: number;        // 1=admin, 2=recepcionista, 3=entrenador, 4=cliente
    usuario: string;
    activo: boolean;
    email: string | null;
    // Campos extra opcionales que puede devolver
    nombre?: string;
    apellido?: string;
}

export interface RegistroRequest {
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
    email: string;
    fechaNacimiento: string;   // "YYYY-MM-DD"
    usuario: string;
    contrasena: string;
    idRol?: number;            // Default: 4 (cliente)
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
}

export interface CrearUsuarioAdminRequest {
    idRol: number;
    usuario: string;
    contrasena: string;
    nombre: string;
    apellido: string;
}

const authService = {
    /**
     * Login con usuario/email y contraseña
     * POST /api/auth/login
     */
    async login(creds: LoginRequest): Promise<LoginResponse> {
        return apiClient.post<LoginResponse>(
            API_CONFIG.ENDPOINTS.AUTH.LOGIN,
            creds
        );
    },

    /**
     * Registro de nuevo cliente (auto-registro)
     * POST /api/auth/registro
     */
    async registro(datos: RegistroRequest): Promise<{ mensaje: string; idUsuario: number }> {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTRO, datos);
    },

    /**
     * Verificar cuenta con código de email
     * POST /api/auth/verificar
     */
    async verificarCuenta(email: string, codigo: string): Promise<{ mensaje: string }> {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFICAR, { email, codigo });
    },

    /**
     * Dashboard del administrador con stats reales
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
        return apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ADMIN_USUARIOS);
    },

    /**
     * Crear nuevo usuario desde el panel admin
     * POST /api/auth/admin/usuarios
     */
    async crearUsuarioAdmin(datos: CrearUsuarioAdminRequest): Promise<{ mensaje: string }> {
        return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.ADMIN_USUARIOS, datos);
    },

    /**
     * Editar usuario desde panel admin
     * PUT /api/auth/admin/usuarios/{id}
     */
    async editarUsuarioAdmin(id: number, datos: Partial<CrearUsuarioAdminRequest>): Promise<{ mensaje: string }> {
        return apiClient.put(API_CONFIG.ENDPOINTS.AUTH.ADMIN_USUARIO_ID(id), datos);
    },

    /**
     * Activar o desactivar usuario (borrado lógico)
     * PUT /api/auth/admin/usuarios/{id}/estado?activo=true/false
     */
    async cambiarEstadoUsuario(id: number, activo: boolean): Promise<{ mensaje: string }> {
        const endpoint = `${API_CONFIG.ENDPOINTS.AUTH.ADMIN_USUARIO_ESTADO(id)}?activo=${activo}`;
        return apiClient.put(endpoint);
    },

    /**
     * Mapea el id_rol numérico al string de rol usado en el frontend
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