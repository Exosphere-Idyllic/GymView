// src/config/api.config.ts
// API real de MathewLara alojada en Render
// NOTA: El free tier de Render tiene "cold starts" de ~30 segundos.
//       Si la primera petición falla por timeout, espera y reintenta.

export const API_CONFIG = {
    // API real alojada en Render
    // NOTA: El free tier de Render tiene "cold starts" de ~30 segundos.
    //       Si la primera petición falla por timeout, espera y reintenta.
    BASE_URL: 'https://gimnasioapi.onrender.com/api',
    TIMEOUT: 35000, // 35s — cold starts en Render free tier pueden llegar a 30s

    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',         // POST
            REGISTRO: '/auth/registro',      // POST
            VERIFICAR: '/auth/verificar',     // POST
            ADMIN_DASHBOARD: '/auth/admin/dashboard', // GET
            ADMIN_USUARIOS: '/auth/admin/usuarios',  // POST, GET
            ADMIN_USUARIO_ID: (id: number) => `/auth/admin/usuarios/${id}`, // PUT
            ADMIN_USUARIO_ESTADO: (id: number) => `/auth/admin/usuarios/${id}/estado`, // PUT
        },
        CLIENTES: {
            BASE: (id: number) => `/clientes/${id}`, // GET (by id_cliente), PUT
            DASHBOARD: (idUsuario: number) => `/clientes/${idUsuario}/dashboard`, // GET
            COMPLETAR: (idUsuario: number) => `/clientes/${idUsuario}/completar`, // POST
            PAGOS: (id: number) => `/clientes/${id}/pagos`, // GET
        },
        ACCESOS: {
            ESCANEAR: (idUsuario: number) => `/accesos/escanear/${idUsuario}`, // POST
            ESTADO: (idUsuario: number) => `/accesos/estado/${idUsuario}`, // GET
            PRESENTES: '/accesos/presentes', // GET
            MANUAL: '/accesos/manual', // POST
            HISTORIAL: (idCliente: number) => `/accesos/historial/${idCliente}`, // GET
            REPORTE_DIA: '/accesos/reporte-dia', // GET
            CERRAR: (idAsistencia: number) => `/accesos/${idAsistencia}/cerrar`, // PUT
            ESTADISTICAS: '/accesos/estadisticas', // GET
            QR_TOKEN: (idUsuario: number) => `/accesos/qr-token/${idUsuario}`, // GET
        },
        ENTRENADORES: {
            BASE: '/entrenadores', // GET, POST
            BY_ID: (id: number) => `/entrenadores/${id}`, // GET, PUT, DELETE
            DASHBOARD: (idUsuario: number) => `/entrenadores/${idUsuario}/dashboard`, // GET
            AGENDA: (idUsuario: number) => `/entrenadores/${idUsuario}/agenda`, // GET
            CREAR_RUTINA: (idUsuario: number) => `/entrenadores/${idUsuario}/crearRutina`, // POST
            RUTINA_ID: (idRutina: number) => `/entrenadores/rutinas/${idRutina}`, // PUT, DELETE
            RUTINA_REACTIVAR: (idRutina: number) => `/entrenadores/rutinas/${idRutina}/reactivar`, // PUT
            ASIGNAR_RUTINA: (idRutinaTemplate: number, idClienteTarget: number) => `/entrenadores/rutinas/${idRutinaTemplate}/asignar/${idClienteTarget}`, // POST
        },
        USUARIOS: {
            BASE: '/usuarios', // GET, POST, PUT
            BY_ID: (id: number) => `/usuarios/${id}`, // GET, DELETE
        },
        MEMBRESIAS: {
            ASIGNAR: (idCliente: number) => `/membresias/${idCliente}`, // POST
        },
        PAGOS: {
            BASE: '/pagos', // GET
        },
        REPORTES: {
            ASISTENCIA: '/reportes/asistencia', // GET
            INGRESOS: '/reportes/ingresos', // GET
            RUTINAS: '/reportes/rutinas', // GET
        },
        VENTAS: {
            BASE: '/ventas', // POST
            COMPROBANTE: (id: number) => `/ventas/${id}/comprobante` // GET
        },
        RUTINAS: {
            EJERCICIOS: '/rutinas/ejercicios', // GET
        },
        PRODUCTOS: {
            BASE: '/productos', // GET
            IMAGEN: (id: number) => `/productos/${id}/imagen`, // GET
        },
        LOGS: {
            ACCESOS: '/logs/accesos', // GET
        },
        PRUEBA: '/prueba', // GET
    },
};

export default API_CONFIG;