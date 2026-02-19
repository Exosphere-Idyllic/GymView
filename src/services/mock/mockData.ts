// src/services/mock/mockData.ts
// Datos mock basados en el esquema PostgreSQL y diseño de Iron Fitness

export const MOCK_USUARIOS = [
  { id_usuario: 1, usuario: 'admin', contrasena: '1234', id_rol: 1, rol: 'admin', nombre_completo: 'Administrador General', estado: true },
  { id_usuario: 2, usuario: 'recep', contrasena: '1234', id_rol: 2, rol: 'recepcionista', nombre_completo: 'Ana Recepción', estado: true },
  { id_usuario: 3, usuario: 'coach', contrasena: '1234', id_rol: 3, rol: 'entrenador', nombre_completo: 'Carlos Mendoza', estado: true },
  { id_usuario: 4, usuario: 'juan', contrasena: '1234', id_rol: 4, rol: 'cliente', nombre_completo: 'Juan Pérez', estado: true },
];

export const MOCK_MEMBRESIAS_TIPOS = [
  { id_tipo_membresia: 1, nombre_tipo: 'Plan Smart', precio: 24.99, duracion_dias: 30 },
  { id_tipo_membresia: 2, nombre_tipo: 'Plan Black', precio: 34.99, duracion_dias: 30 },
];

export const MOCK_CLIENTES = [
  {
    id_cliente: 1, id_usuario: 4, nombre: 'Juan', apellido: 'Pérez',
    email: 'juan@email.com', telefono: '0991234567',
    fecha_nacimiento: '1995-03-15',
    id_membresia: 2, fecha_vencimiento: '2026-03-18',
    nombrePlan: 'Plan Black', estadoMembresia: 'Activa',
    id_entrenador: 1,
  },
  {
    id_cliente: 2, id_usuario: 5, nombre: 'María', apellido: 'López',
    email: 'maria@email.com', telefono: '0987654321',
    fecha_nacimiento: '1998-07-22',
    id_membresia: 1, fecha_vencimiento: '2025-12-01',
    nombrePlan: 'Plan Smart', estadoMembresia: 'Vencida',
    id_entrenador: 1,
  },
  {
    id_cliente: 3, id_usuario: 6, nombre: 'Pedro', apellido: 'Gómez',
    email: 'pedro@email.com', telefono: '0976543210',
    fecha_nacimiento: '1990-11-05',
    id_membresia: 2, fecha_vencimiento: '2026-04-10',
    nombrePlan: 'Plan Black', estadoMembresia: 'Activa',
    id_entrenador: 1,
  },
  {
    id_cliente: 4, id_usuario: 7, nombre: 'Sofía', apellido: 'Ramírez',
    email: 'sofia@email.com', telefono: '0965432109',
    fecha_nacimiento: '2000-01-30',
    id_membresia: 1, fecha_vencimiento: '2025-11-15',
    nombrePlan: 'Plan Smart', estadoMembresia: 'Vencida',
    id_entrenador: 1,
  },
];

export const MOCK_ENTRENADORES = [
  {
    id_entrenador: 1, id_usuario: 3, nombre: 'Carlos', apellido: 'Mendoza',
    email: 'carlos@ironfitness.com', especialidad: 'Musculación y Fuerza',
    notas_desempeno: 'Excelente desempeño, alto índice de satisfacción',
    totalAlumnos: 4, rutinasCreadas: 3,
  },
  {
    id_entrenador: 2, id_usuario: 8, nombre: 'Laura', apellido: 'Torres',
    email: 'laura@ironfitness.com', especialidad: 'Cardio y HIIT',
    notas_desempeno: 'Especialista certificada en entrenamiento funcional',
    totalAlumnos: 2, rutinasCreadas: 2,
  },
];

export const MOCK_EJERCICIOS = [
  { id_ejercicio: 1, nombre_ejercicio: 'Press de Banca Plano', grupo_muscular: 'Pecho' },
  { id_ejercicio: 2, nombre_ejercicio: 'Sentadilla con Barra', grupo_muscular: 'Piernas' },
  { id_ejercicio: 3, nombre_ejercicio: 'Jalón al Pecho', grupo_muscular: 'Espalda' },
  { id_ejercicio: 4, nombre_ejercicio: 'Curl con Mancuernas', grupo_muscular: 'Bíceps' },
  { id_ejercicio: 5, nombre_ejercicio: 'Press Militar', grupo_muscular: 'Hombros' },
  { id_ejercicio: 6, nombre_ejercicio: 'Peso Muerto', grupo_muscular: 'Espalda / Piernas' },
  { id_ejercicio: 7, nombre_ejercicio: 'Fondos en Paralelas', grupo_muscular: 'Tríceps' },
  { id_ejercicio: 8, nombre_ejercicio: 'Plancha Abdominal', grupo_muscular: 'Core' },
];

export const MOCK_RUTINAS = [
  {
    id_rutina: 1, id_cliente: 1, id_entrenador: 1,
    nombre_rutina: 'Rutina de Fuerza - Tren Superior',
    objetivo: 'Incrementar masa muscular en torso',
    fecha_creacion: '2026-01-10',
    activa: true,
    ejercicios: [
      { id_ejercicio: 1, nombre_ejercicio: 'Press de Banca Plano', grupo_muscular: 'Pecho', series: '4', repeticiones: '10-12' },
      { id_ejercicio: 3, nombre_ejercicio: 'Jalón al Pecho', grupo_muscular: 'Espalda', series: '4', repeticiones: '10-12' },
      { id_ejercicio: 5, nombre_ejercicio: 'Press Militar', grupo_muscular: 'Hombros', series: '3', repeticiones: '10' },
      { id_ejercicio: 4, nombre_ejercicio: 'Curl con Mancuernas', grupo_muscular: 'Bíceps', series: '3', repeticiones: '12' },
      { id_ejercicio: 7, nombre_ejercicio: 'Fondos en Paralelas', grupo_muscular: 'Tríceps', series: '3', repeticiones: '12' },
    ],
  },
  {
    id_rutina: 2, id_cliente: 1, id_entrenador: 1,
    nombre_rutina: 'Rutina de Piernas',
    objetivo: 'Fortalecer tren inferior',
    fecha_creacion: '2026-01-15',
    activa: true,
    ejercicios: [
      { id_ejercicio: 2, nombre_ejercicio: 'Sentadilla con Barra', grupo_muscular: 'Piernas', series: '5', repeticiones: '8-10' },
      { id_ejercicio: 6, nombre_ejercicio: 'Peso Muerto', grupo_muscular: 'Espalda / Piernas', series: '4', repeticiones: '8' },
      { id_ejercicio: 8, nombre_ejercicio: 'Plancha Abdominal', grupo_muscular: 'Core', series: '3', repeticiones: '60 seg' },
    ],
  },
  {
    id_rutina: 3, id_cliente: 3, id_entrenador: 1,
    nombre_rutina: 'Full Body Funcional',
    objetivo: 'Acondicionamiento general',
    fecha_creacion: '2026-01-20',
    activa: true,
    ejercicios: [
      { id_ejercicio: 2, nombre_ejercicio: 'Sentadilla con Barra', grupo_muscular: 'Piernas', series: '3', repeticiones: '15' },
      { id_ejercicio: 1, nombre_ejercicio: 'Press de Banca Plano', grupo_muscular: 'Pecho', series: '3', repeticiones: '15' },
      { id_ejercicio: 8, nombre_ejercicio: 'Plancha Abdominal', grupo_muscular: 'Core', series: '3', repeticiones: '45 seg' },
    ],
  },
];

export const MOCK_ASISTENCIAS = [
  { id_asistencia: 1, id_cliente: 1, fecha_hora_ingreso: '2026-02-18T08:30:00', dispositivo_qr: 'Mobile App', codigo_validado: 'QR_001', fecha_hora_salida: '2026-02-18T10:15:00' },
  { id_asistencia: 2, id_cliente: 1, fecha_hora_ingreso: '2026-02-17T07:45:00', dispositivo_qr: 'Mobile App', codigo_validado: 'QR_002', fecha_hora_salida: '2026-02-17T09:30:00' },
  { id_asistencia: 3, id_cliente: 1, fecha_hora_ingreso: '2026-02-15T09:00:00', dispositivo_qr: 'Kiosco-01', codigo_validado: 'QR_003', fecha_hora_salida: '2026-02-15T10:45:00' },
  { id_asistencia: 4, id_cliente: 3, fecha_hora_ingreso: '2026-02-18T06:30:00', dispositivo_qr: 'Kiosco-01', codigo_validado: 'QR_004', fecha_hora_salida: null },
  { id_asistencia: 5, id_cliente: 2, fecha_hora_ingreso: '2026-02-18T10:00:00', dispositivo_qr: 'Mobile App', codigo_validado: 'QR_005', fecha_hora_salida: '2026-02-18T11:30:00' },
];

export const MOCK_PAGOS = [
  { id_pago: 1, id_cliente: 1, monto: 34.99, fecha_pago: '2026-01-18', metodo_pago: 'tarjeta', estado: 'completado', observaciones: 'Renovación Plan Black' },
  { id_pago: 2, id_cliente: 3, monto: 34.99, fecha_pago: '2026-01-10', metodo_pago: 'efectivo', estado: 'completado', observaciones: 'Renovación Plan Black' },
  { id_pago: 3, id_cliente: 2, monto: 24.99, fecha_pago: '2025-11-01', metodo_pago: 'transferencia', estado: 'completado', observaciones: 'Pago Plan Smart' },
  { id_pago: 4, id_cliente: 4, monto: 24.99, fecha_pago: '2025-10-15', metodo_pago: 'efectivo', estado: 'completado', observaciones: 'Pago Plan Smart' },
];

export const MOCK_LOGS_ACCESO = [
  { id_log: 1, id_usuario: 1, usuario: 'admin', rol: 'Administrador', fecha_hora_acceso: '2026-02-18T08:00:00', ip_acceso: '192.168.0.10', tipo_dispositivo: 'Desktop' },
  { id_log: 2, id_usuario: 2, usuario: 'recep', rol: 'Recepcionista', fecha_hora_acceso: '2026-02-18T07:55:00', ip_acceso: '192.168.0.11', tipo_dispositivo: 'Desktop' },
  { id_log: 3, id_usuario: 4, usuario: 'juan', rol: 'Cliente', fecha_hora_acceso: '2026-02-18T08:25:00', ip_acceso: '192.168.0.101', tipo_dispositivo: 'Mobile' },
  { id_log: 4, id_usuario: 3, usuario: 'coach', rol: 'Entrenador', fecha_hora_acceso: '2026-02-17T09:00:00', ip_acceso: '192.168.0.15', tipo_dispositivo: 'Tablet' },
];

// Stats calculados para dashboard admin
export const MOCK_STATS = {
  clientesActivos: MOCK_CLIENTES.filter(c => c.estadoMembresia === 'Activa').length,
  ingresosMes: MOCK_PAGOS.reduce((acc, p) => acc + p.monto, 0).toFixed(2),
  asistenciasHoy: MOCK_ASISTENCIAS.filter(a => a.fecha_hora_ingreso.startsWith('2026-02-18')).length,
  membresiasVencidas: MOCK_CLIENTES.filter(c => c.estadoMembresia === 'Vencida').length,
  personasEntrenando: MOCK_ASISTENCIAS.filter(a => a.fecha_hora_ingreso.startsWith('2026-02-18') && !a.fecha_hora_salida).length,
};
