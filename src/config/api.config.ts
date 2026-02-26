// src/config/api.config.ts
// API real de MathewLara alojada en Render
// NOTA: El free tier de Render tiene "cold starts" de ~30 segundos.
//       Si la primera petición falla por timeout, espera y reintenta.

export const API_CONFIG = {
    BASE_URL: 'https://gimnasio-f7td.onrender.com/Gimnasio/api',
    TIMEOUT: 35000, // 35s — cold starts en Render free tier pueden llegar a 30s

    ENDPOINTS: {
        AUTH: {
            LOGIN:                '/auth/login',
            REGISTRO:             '/auth/registro',
            VERIFICAR:            '/auth/verificar',
            ADMIN_DASHBOARD:      '/auth/admin/dashboard',
            ADMIN_USUARIOS:       '/auth/admin/usuarios',
            ADMIN_USUARIO_ID:     (id: number) => `/auth/admin/usuarios/${id}`,
            ADMIN_USUARIO_ESTADO: (id: number) => `/auth/admin/usuarios/${id}/estado`,
        },
        CLIENTES: {
            DASHBOARD:  (idUsuario: number) => `/clientes/${idUsuario}/dashboard`,
            COMPLETAR:  (idUsuario: number) => `/clientes/${idUsuario}/completar`,
        },
        ENTRENADORES: {
            DASHBOARD:       (idUsuario: number) => `/entrenadores/${idUsuario}/dashboard`,
            CREAR_RUTINA:    (idUsuario: number) => `/entrenadores/${idUsuario}/crearRutina`,
            AGENDA:          (idUsuario: number) => `/entrenadores/${idUsuario}/agenda`,
            RUTINA_ID:       (idRutina: number)  => `/entrenadores/rutinas/${idRutina}`,
            RUTINA_REACTIVAR:(idRutina: number)  => `/entrenadores/rutinas/${idRutina}/reactivar`,
        },
        ACCESOS: {
            ESCANEAR: (idUsuario: number) => `/accesos/escanear/${idUsuario}`,
        },
        PRODUCTOS: {
            BASE:   '/productos',
            IMAGEN: (id: number) => `/productos/${id}/imagen`,
        },
        VENTAS: {
            BASE: '/ventas',
        },
        USUARIOS: {
            BASE:   '/usuarios',
            BY_ID:  (id: number) => `/usuarios/${id}`,
        },
        PRUEBA: '/prueba',
    },
};

export default API_CONFIG;