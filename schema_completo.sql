-- ============================================================
--  SCHEMA COMPLETO — Gimnasio API
--  Generado desde el código fuente (DAOs y Controladores)
--  Ejecutar en orden: las FKs dependen de tablas anteriores
-- ============================================================

-- ============================================================
--  1. ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id_rol      SERIAL PRIMARY KEY,
    nombre_rol  VARCHAR(50) NOT NULL UNIQUE
);

-- Datos iniciales obligatorios (el sistema depende de estos IDs)
INSERT INTO roles (id_rol, nombre_rol) VALUES
    (1, 'Administrador'),
    (2, 'Recepcion'),
    (3, 'Entrenador'),
    (4, 'Cliente')
ON CONFLICT (id_rol) DO NOTHING;

-- ============================================================
--  2. USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario     SERIAL PRIMARY KEY,
    id_rol         INTEGER NOT NULL REFERENCES roles(id_rol),
    usuario        VARCHAR(100) NOT NULL UNIQUE,
    contrasena     VARCHAR(255) NOT NULL,
    activo         BOOLEAN NOT NULL DEFAULT FALSE,
    nombre         VARCHAR(100),
    apellido       VARCHAR(100),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  3. MEMBRESÍAS
-- ============================================================
CREATE TABLE IF NOT EXISTS membresias (
    id_membresia SERIAL PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    precio       NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Datos iniciales de ejemplo
INSERT INTO membresias (nombre, precio) VALUES
    ('Smart',  25.00),
    ('Black',  40.00),
    ('Plus',   55.00)
ON CONFLICT DO NOTHING;

-- ============================================================
--  4. TIPOS DE MEMBRESÍA (con duración en días)
-- ============================================================
CREATE TABLE IF NOT EXISTS tipos_membresia (
    id_tipo_membresia SERIAL PRIMARY KEY,
    nombre            VARCHAR(100) NOT NULL,
    precio            NUMERIC(10, 2) NOT NULL DEFAULT 0,
    duracion_dias     INTEGER NOT NULL DEFAULT 30
);

INSERT INTO tipos_membresia (nombre, precio, duracion_dias) VALUES
    ('Smart  - Mensual',   25.00, 30),
    ('Black  - Mensual',   40.00, 30),
    ('Plus   - Mensual',   55.00, 30),
    ('Smart  - Trimestral',65.00, 90),
    ('Black  - Trimestral',105.00, 90)
ON CONFLICT DO NOTHING;

-- ============================================================
--  5. CLIENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente        SERIAL PRIMARY KEY,
    id_usuario        INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre            VARCHAR(100) NOT NULL,
    apellido          VARCHAR(100) NOT NULL,
    email             VARCHAR(150) NOT NULL UNIQUE,
    telefono          VARCHAR(20),
    cedula            VARCHAR(15),
    fecha_nacimiento  DATE,
    id_membresia      INTEGER REFERENCES membresias(id_membresia),
    fecha_vencimiento DATE
);

-- ============================================================
--  6. ENTRENADORES
-- ============================================================
CREATE TABLE IF NOT EXISTS entrenadores (
    id_entrenador    SERIAL PRIMARY KEY,
    id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    email            VARCHAR(150),
    especialidad     VARCHAR(150),
    notas_desempeno  TEXT
);

-- ============================================================
--  7. EJERCICIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS ejercicios (
    id_ejercicio    SERIAL PRIMARY KEY,
    nombre_ejercicio VARCHAR(150) NOT NULL,
    grupo_muscular   VARCHAR(100)
);

-- Catálogo inicial de ejercicios
INSERT INTO ejercicios (nombre_ejercicio, grupo_muscular) VALUES
    ('Press de Banca',          'Pecho'),
    ('Sentadilla',              'Piernas'),
    ('Peso Muerto',             'Espalda'),
    ('Press Militar',           'Hombros'),
    ('Curl de Bíceps',          'Bíceps'),
    ('Extensión de Tríceps',    'Tríceps'),
    ('Remo con Barra',          'Espalda'),
    ('Zancadas',                'Piernas'),
    ('Plancha',                 'Core'),
    ('Dominadas',               'Espalda'),
    ('Fondos en Paralelas',     'Pecho'),
    ('Hip Thrust',              'Glúteos'),
    ('Face Pull',               'Hombros'),
    ('Leg Press',               'Piernas'),
    ('Jalón al Pecho',          'Espalda')
ON CONFLICT DO NOTHING;

-- ============================================================
--  8. RUTINAS
-- ============================================================
CREATE TABLE IF NOT EXISTS rutinas (
    id_rutina     SERIAL PRIMARY KEY,
    id_cliente    INTEGER NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    id_entrenador INTEGER REFERENCES entrenadores(id_entrenador),
    nombre_rutina VARCHAR(150) NOT NULL,
    fecha_creacion DATE NOT NULL DEFAULT CURRENT_DATE,
    activa        BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
--  9. DETALLE DE RUTINAS
-- ============================================================
CREATE TABLE IF NOT EXISTS detalle_rutinas (
    id_detalle    SERIAL PRIMARY KEY,
    id_rutina     INTEGER NOT NULL REFERENCES rutinas(id_rutina) ON DELETE CASCADE,
    id_ejercicio  INTEGER NOT NULL REFERENCES ejercicios(id_ejercicio),
    series        VARCHAR(20) DEFAULT '4',
    repeticiones  VARCHAR(20) DEFAULT '12',
    descanso      VARCHAR(50)             -- añadido por migracion_rf.sql
);

-- ============================================================
--  10. ASISTENCIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS asistencias (
    id_asistencia      SERIAL PRIMARY KEY,
    id_cliente         INTEGER NOT NULL REFERENCES clientes(id_cliente),
    fecha_hora_ingreso TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_hora_salida  TIMESTAMP,
    observacion        VARCHAR(255)        -- añadido por migracion_rf.sql
);

-- ============================================================
--  11. HISTORIAL DE ENTRENAMIENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS historial_entrenamientos (
    id_historial SERIAL PRIMARY KEY,
    id_cliente   INTEGER NOT NULL REFERENCES clientes(id_cliente),
    id_rutina    INTEGER NOT NULL REFERENCES rutinas(id_rutina),
    fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (id_cliente, fecha)             -- evita duplicados el mismo día
);

-- ============================================================
--  12. PAGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
    id_pago                SERIAL PRIMARY KEY,
    id_membresia           INTEGER REFERENCES membresias(id_membresia),
    monto_pagado           NUMERIC(10, 2) NOT NULL,
    metodo_pago            VARCHAR(50) NOT NULL DEFAULT 'EFECTIVO',
    fecha_pago             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    referencia_comprobante VARCHAR(100),
    id_cliente             INTEGER REFERENCES clientes(id_cliente)  -- añadido por migracion_rf.sql
);

-- ============================================================
--  13. FACTURA ENCABEZADOS
-- ============================================================
CREATE TABLE IF NOT EXISTS factura_encabezados (
    id_factura    SERIAL PRIMARY KEY,
    id_pago       INTEGER NOT NULL REFERENCES pagos(id_pago),
    numero_factura VARCHAR(50) NOT NULL UNIQUE,
    subtotal      NUMERIC(10, 2) NOT NULL DEFAULT 0,
    iva           NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_pagado  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_cliente    INTEGER REFERENCES clientes(id_cliente)           -- añadido por migracion_rf.sql
);

-- ============================================================
--  14. FACTURA DETALLES
-- ============================================================
CREATE TABLE IF NOT EXISTS factura_detalles (
    id_detalle_factura SERIAL PRIMARY KEY,
    id_factura         INTEGER NOT NULL REFERENCES factura_encabezados(id_factura) ON DELETE CASCADE,
    descripcion        VARCHAR(255) NOT NULL,
    cantidad           INTEGER NOT NULL DEFAULT 1,
    precio_unitario    NUMERIC(10, 2) NOT NULL DEFAULT 0,
    subtotal_linea     NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- ============================================================
--  15. PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
    id_producto  SERIAL PRIMARY KEY,
    nombre       VARCHAR(150) NOT NULL,
    descripcion  TEXT,
    precio       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tipo         VARCHAR(100),
    imagen       BYTEA                   -- foto almacenada en BD (opcional)
);

-- ============================================================
--  16. CÓDIGOS DE VERIFICACIÓN
-- ============================================================
CREATE TABLE IF NOT EXISTS codigos_verificacion (
    id_codigo        SERIAL PRIMARY KEY,
    id_usuario       INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    codigo           VARCHAR(10) NOT NULL,
    fecha_expiracion TIMESTAMP NOT NULL,
    usado            BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
--  17. LOGS DE ACCESO
-- ============================================================
CREATE TABLE IF NOT EXISTS logs_acceso (
    id_log          SERIAL PRIMARY KEY,
    id_usuario      INTEGER REFERENCES usuarios(id_usuario),
    fecha_hora_log  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    direccion_ip    VARCHAR(50),
    tipo_dispositivo VARCHAR(100),
    exitoso         BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
--  ÍNDICES — mejoran velocidad de las consultas más frecuentes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_asistencias_cliente_fecha
    ON asistencias (id_cliente, fecha_hora_ingreso DESC);

CREATE INDEX IF NOT EXISTS idx_asistencias_sin_salida
    ON asistencias (id_cliente, fecha_hora_salida)
    WHERE fecha_hora_salida IS NULL;

CREATE INDEX IF NOT EXISTS idx_rutinas_cliente
    ON rutinas (id_cliente, activa);

CREATE INDEX IF NOT EXISTS idx_rutinas_entrenador
    ON rutinas (id_entrenador, activa);

CREATE INDEX IF NOT EXISTS idx_pagos_cliente
    ON pagos (id_cliente, fecha_pago DESC);

CREATE INDEX IF NOT EXISTS idx_logs_acceso_fecha
    ON logs_acceso (fecha_hora_log DESC);

CREATE INDEX IF NOT EXISTS idx_codigos_usuario
    ON codigos_verificacion (id_usuario, usado);

-- ============================================================
--  USUARIO ADMINISTRADOR INICIAL
--  Contraseña: Admin2026 (BCrypt hash — cámbiala después del primer login)
-- ============================================================
INSERT INTO usuarios (id_rol, usuario, contrasena, activo, nombre, apellido)
VALUES (
    1,
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHuu',
    TRUE,
    'Administrador',
    'Sistema'
) ON CONFLICT (usuario) DO NOTHING;
