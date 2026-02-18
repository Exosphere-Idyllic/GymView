// src/config/api.config.ts

/**
 * Configuración central de la API
 * Ajusta estos valores según tu entorno
 */

export const API_CONFIG = {
    // URLs por entorno
    BASE_URL: __DEV__
        ? 'http://localhost:8080/api'  // Desarrollo
        : 'https://tu-backend-prod.com/api', // Producción

    // Timeout en milisegundos
    TIMEOUT: 10000,

    // Headers por defecto
    HEADERS: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },

    // Configuración de reintentos
    RETRY_CONFIG: {
        maxRetries: 3,
        retryDelay: 1000, // ms
    },

    // Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh',
            VERIFY_CODE: '/auth/verify-code',
        },
        USUARIOS: {
            BASE: '/usuarios',
            BY_ID: (id: number) => `/usuarios/${id}`,
            BY_ROLE: (role: string) => `/usuarios/role/${role}`,
        },
        CLIENTES: {
            BASE: '/clientes',
            BY_ID: (id: number) => `/clientes/${id}`,
            MEMBRESIAS: (id: number) => `/clientes/${id}/membresias`,
            RUTINAS: (id: number) => `/clientes/${id}/rutinas`,
        },
        ENTRENADORES: {
            BASE: '/entrenadores',
            BY_ID: (id: number) => `/entrenadores/${id}`,
            CLIENTES: (id: number) => `/entrenadores/${id}/clientes`,
            RUTINAS: (id: number) => `/entrenadores/${id}/rutinas`,
        },
        RUTINAS: {
            BASE: '/rutinas',
            BY_ID: (id: number) => `/rutinas/${id}`,
            EJERCICIOS: (id: number) => `/rutinas/${id}/ejercicios`,
        },
        ASISTENCIA: {
            BASE: '/asistencias',
            VALIDATE_QR: '/asistencias/validate-qr',
            BY_CLIENTE: (id: number) => `/asistencias/cliente/${id}`,
            TODAY: '/asistencias/today',
        },
        PAGOS: {
            BASE: '/pagos',
            BY_ID: (id: number) => `/pagos/${id}`,
            BY_CLIENTE: (id: number) => `/pagos/cliente/${id}`,
            FACTURAS: (id: number) => `/pagos/${id}/facturas`,
        },
        REPORTES: {
            ASISTENCIA: '/reportes/asistencia',
            INGRESOS: '/reportes/ingresos',
            MEMBRESIAS: '/reportes/membresias',
            ENTRENADORES: '/reportes/entrenadores',
        },
    },
};

export default API_CONFIG;