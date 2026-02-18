// src/types/database.types.ts

/**
 * Tipos TypeScript basados en el esquema de PostgreSQL
 * Generados desde Gimnasio.sql
 */

// ============== USUARIOS Y ROLES ==============

export interface Rol {
    id_rol: number;
    nombre_rol: 'admin' | 'recepcionista' | 'entrenador' | 'cliente';
    descripcion?: string;
}

export interface Usuario {
    id_usuario: number;
    usuario: string;
    contrasena: string; // En cliente NO se debe usar nunca
    id_rol: number;
    estado: boolean;
    fecha_registro: Date;
    ultimo_acceso?: Date;
}

export interface LogAcceso {
    id_log: number;
    id_usuario: number;
    fecha_hora_acceso: Date;
    ip_acceso?: string;
    tipo_dispositivo?: string;
}

// ============== CLIENTES ==============

export interface TipoMembresia {
    id_tipo_membresia: number;
    nombre_tipo: string;
    precio: number;
    duracion_dias: number;
}

export interface Membresia {
    id_membresia: number;
    id_tipo_membresia: number;
    fecha_inicio: Date;
    fecha_fin: Date;
    precio_pagado: number;
    estado: 'activa' | 'vencida' | 'cancelada';
}

export interface Cliente {
    id_cliente: number;
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    fecha_nacimiento?: Date;
    id_membresia?: number;
    fecha_vencimiento?: Date;
}

// ============== ENTRENADORES ==============

export interface Entrenador {
    id_entrenador: number;
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    especialidad?: string;
    notas_desempeno?: string;
}

// ============== RUTINAS Y EJERCICIOS ==============

export interface Ejercicio {
    id_ejercicio: number;
    nombre_ejercicio: string;
    grupo_muscular?: string;
}

export interface Rutina {
    id_rutina: number;
    id_cliente: number;
    id_entrenador?: number;
    nombre_rutina: string;
    objetivo?: string;
    fecha_creacion: Date;
}

export interface DetalleRutina {
    id_detalle: number;
    id_rutina: number;
    id_ejercicio: number;
    series?: string;
    repeticiones?: string;
}

export interface HistorialEntrenamiento {
    id_historial: number;
    id_cliente: number;
    id_rutina?: number;
    fecha: Date;
    ejercicio_realizado?: string;
    series_completadas?: number;
    notas?: string;
}

// ============== ASISTENCIA ==============

export interface Asistencia {
    id_asistencia: number;
    id_cliente: number;
    fecha_hora_ingreso: Date;
    dispositivo_qr?: string;
    codigo_validado?: string;
    fecha_hora_salida?: Date;
}

// ============== PAGOS Y FACTURACIÓN ==============

export interface Pago {
    id_pago: number;
    id_cliente: number;
    monto: number;
    fecha_pago: Date;
    metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
    estado: 'completado' | 'pendiente' | 'cancelado';
    observaciones?: string;
}

export interface FacturaEncabezado {
    id_factura: number;
    id_pago: number;
    numero_factura: string;
    fecha_emision: Date;
    razon_social_cliente: string;
    ruc_cliente: string;
    direccion_cliente?: string;
    subtotal: number;
    iva: number;
    total: number;
}

export interface FacturaDetalle {
    id_detalle_factura: number;
    id_factura: number;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    subtotal_linea: number;
}

// ============== PRODUCTOS E INVENTARIO ==============

export interface Proveedor {
    id_proveedor: number;
    id_usuario: number;
    nombre_proveedor: string;
    ruc: string;
    telefono?: string;
    email?: string;
    direccion?: string;
}

export interface Producto {
    id_producto: number;
    nombre_producto: string;
    categoria?: string;
    precio_venta: number;
    stock_actual: number;
    stock_minimo: number;
}

export interface MovimientoInventario {
    id_movimiento: number;
    id_producto: number;
    tipo_movimiento: 'entrada' | 'salida';
    cantidad: number;
    fecha_movimiento: Date;
    descripcion?: string;
}

// ============== CÓDIGOS DE VERIFICACIÓN ==============

export interface CodigoVerificacion {
    id_codigo: number;
    id_usuario: number;
    codigo: string;
    fecha_expiracion: Date;
    usado: boolean;
}

// ============== TIPOS DE RESPUESTA API ==============

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============== TIPOS PARA FORMULARIOS ==============

export interface ClienteFormData {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    fecha_nacimiento?: Date;
    usuario: string;
    contrasena: string;
    id_tipo_membresia?: number;
}

export interface EntrenadorFormData {
    nombre: string;
    apellido: string;
    email: string;
    especialidad?: string;
    usuario: string;
    contrasena: string;
}

export interface RutinaFormData {
    nombre_rutina: string;
    objetivo?: string;
    id_cliente: number;
    ejercicios: Array<{
        id_ejercicio: number;
        series: string;
        repeticiones: string;
    }>;
}

// ============== TIPOS PARA AUTENTICACIÓN ==============

export interface LoginCredentials {
    usuario: string;
    contrasena: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id_usuario: number;
        usuario: string;
        rol: string;
        nombre_completo: string;
    };
}

// ============== TIPOS PARA QR ==============

export interface QRData {
    id_cliente: number;
    codigo: string;
    timestamp: number;
    expiracion: number;
}

export interface QRValidationResponse {
    valido: boolean;
    mensaje: string;
    asistencia?: Asistencia;
}