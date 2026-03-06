# Validación de Requerimientos Funcionales (RF) — Frontend GymView

**Referencia:** documento *gimnasio.pdf* (Sistema de Gestión de Gimnasio).  
**Alcance:** validación **exclusiva del frontend** respecto a lo que cada RF implica en interfaz, flujos y consumo de API.

---

## RF01 - Gestión de Usuarios

**Requerimiento (PDF):** *El sistema permitirá registrar, modificar, eliminar y consultar usuarios, incluyendo roles como administrador, recepcionista, entrenador y cliente. Cada usuario contará con credenciales únicas, y se validará su autenticación al ingresar al sistema.*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Registrar usuarios | ✅ Cumple | Admin: crear usuario desde Dashboard (POST `/auth/admin/usuarios`). Crear cliente/entrenador desde pantallas dedicadas (mismo endpoint con `idRol`). Servicio `usuarios.service`: POST `/usuarios/`. |
| Modificar usuarios | ✅ Cumple | Admin: editar usuario en modal (PUT `/auth/admin/usuarios/{id}`). Perfil: editar datos propios (PUT `/usuarios/{id}` vía `usuarios.service.actualizar`). |
| Eliminar / inactivar | ✅ Cumple | Admin: activar/desactivar usuario (PUT `/auth/admin/usuarios/{id}/estado`). Servicio `usuarios.service.eliminar` (DELETE `/usuarios/{id}`) disponible. |
| Consultar usuarios | ✅ Cumple | Admin: listado de usuarios (GET `/auth/admin/usuarios`). `usuarios.service.listar()` y `obtenerPorId(id)` para GET `/usuarios/` y `/usuarios/{id}`. |
| Roles (admin, recepcionista, entrenador, cliente) | ✅ Cumple | Roles en login, en formularios de creación (idRol 1–4) y en navegación por rol (dashboards). |
| Credenciales únicas y validación al ingresar | ✅ Cumple | Login con usuario y contraseña; validación en backend; sesión en contexto y AsyncStorage. |

**Veredicto RF01:** **Cumple.**

---

## RF02 - Autenticación y Autorización

**Requerimiento (PDF):** *El backend controlará el acceso mediante autenticación por usuario y contraseña. Una vez autenticado, se generará un token de sesión (JWT o similar) que será utilizado para autorizar el acceso a los endpoints protegidos.*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Login usuario/contraseña | ✅ Cumple | Pantalla de login (`(auth)/login.tsx`), `authService.login()`, POST `/auth/login`. |
| Sesión / persistencia | ✅ Cumple | `AuthContext` guarda usuario en estado y AsyncStorage; restaura sesión al abrir la app. |
| Redirección por rol | ✅ Cumple | Tras login, `(tabs)/index` muestra DashboardAdmin, DashboardRecepcionista, DashboardEntrenador o DashboardCliente según `user.rol`. |
| Uso de token en API | ⚠️ Parcial | El frontend envía sesión implícita (usuario en contexto); no se ve envío explícito de JWT en headers en `api.client.ts`. Si el backend exige Authorization Bearer, habría que añadir el token en las peticiones. |

**Veredicto RF02:** **Cumple** a nivel de flujo de login y rol; **parcial** si el backend requiere envío explícito de JWT en cabeceras (depende del backend).

---

## RF03 - Gestión de Clientes

**Requerimiento (PDF):** *Permitirá registrar nuevos clientes con información personal, estado de membresía, historial de pagos y rutinas asignadas. También se incluirá la posibilidad de inactivar clientes o actualizar sus datos según sea necesario.*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Registrar clientes | ✅ Cumple | Admin: pantalla Crear Cliente (`clientes/crear.tsx`) con POST `/auth/admin/usuarios` (idRol: 4). Registro público en `(auth)/registro.tsx` (POST `/auth/registro`) + verificación (POST `/auth/verificar`). |
| Información personal | ✅ Cumple | Formularios de registro y creación; dashboard cliente muestra nombre, email, teléfono (API GET `/clientes/{id}/dashboard`). |
| Estado de membresía | ✅ Cumple | Dashboard cliente: pestaña Membresía con estado (Activo/Vencido), plan, vencimiento. Detalle cliente (`clientes/[id].tsx`) muestra membresía (datos actualmente mock). |
| Historial de pagos | ⚠️ Parcial | Admin: pestaña Pagos en DashboardAdmin con historial (datos **mock** `MOCK_PAGOS`). Detalle cliente muestra pagos mock. No hay consumo de API específica de pagos en el front. |
| Rutinas asignadas | ✅ Cumple | Dashboard cliente: rutina actual y ejercicios (API). Detalle cliente: rutinas asignadas (mock). |
| Inactivar / actualizar clientes | ⚠️ Parcial | Inactivar: vía gestión de usuarios (admin) al desactivar usuario. Actualizar datos: detalle cliente tiene botón "Editar" pero solo Alert; no hay formulario conectado al API. |

**Veredicto RF03:** **Cumple** en registro, dashboard cliente (API), membresía y rutinas. **Parcial** en historial de pagos (mock) y edición de cliente desde detalle (sin flujo completo al API).

---

## RF04 - Gestión de Entrenadores

**Requerimiento (PDF):** *El sistema permitirá registrar entrenadores, asignarlos a clientes y consultar sus horarios, rutinas creadas y desempeño. Los entrenadores podrán consultar sus rutinas activas y los clientes que tienen asignados.*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Registrar entrenadores | ✅ Cumple | Admin: `entrenadores/crear.tsx` con POST `/auth/admin/usuarios` (idRol: 3). |
| Asignar a clientes | ✅ Cumple | Implícito al crear rutinas: el entrenador asigna rutina a un alumno (idCliente). Lista de alumnos en dashboard viene del API. |
| Consultar horarios / agenda | ⚠️ Parcial | Servicio `entrenadoresService.getAgenda(idUsuario)` (GET `/entrenadores/{id}/agenda`) existe, pero **no hay pantalla o pestaña "Agenda del día"** en el dashboard del entrenador. |
| Rutinas creadas y desempeño | ✅ Cumple | Dashboard entrenador: tablero con rutinas activas, alumnos, estado (terminó hoy). Biblioteca de rutinas con crear/editar/desactivar/reactivar. |
| Rutinas activas y clientes asignados | ✅ Cumple | Dashboard entrenador: pestañas Tablero, Alumnos, Rutinas; datos desde GET `/entrenadores/{id}/dashboard`. |

**Veredicto RF04:** **Cumple** salvo **consulta de agenda/horarios en UI**: el endpoint existe pero no se muestra en la interfaz.

---

## RF05 - Gestión de Rutinas

**Requerimiento (PDF):** *Los entrenadores podrán crear, modificar y eliminar rutinas personalizadas para los clientes. Cada rutina incluirá ejercicios, series, repeticiones, tiempos de descanso y observaciones. Estas rutinas estarán disponibles para los clientes desde el frontend.*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Crear rutinas | ✅ Cumple | Dashboard entrenador: modal "Nueva Rutina" (nombre, cliente, ejercicios). POST `/entrenadores/{id}/crearRutina`. |
| Modificar rutinas | ✅ Cumple | Editar rutina en modal; PUT `/entrenadores/rutinas/{idRutina}`. |
| Eliminar (desactivar) rutinas | ✅ Cumple | Desactivar rutina; DELETE `/entrenadores/rutinas/{idRutina}`. Reactivar con PUT `.../reactivar`. |
| Ejercicios en rutina | ✅ Cumple | Selección de ejercicios por IDs; el backend define series/repeticiones. El DTO enviado es `idCliente`, `nombreRutina`, `idsEjercicios`. |
| Series, repeticiones, descanso, observaciones | ⚠️ Parcial | El front solo envía `idsEjercicios`; no hay campos de series/repeticiones/descanso/observaciones en el formulario. Si el backend los toma por defecto o de otra entidad, puede cumplirse en backend. |
| Rutinas disponibles para clientes | ✅ Cumple | Dashboard cliente: rutina actual, ejercicios y "series x reps" desde GET `/clientes/{id}/dashboard`; botón "Completar rutina" (POST `/clientes/{id}/completar`). |

**Veredicto RF05:** **Cumple** en crear, modificar, eliminar y visualización cliente. **Parcial** si el RF exige que el frontend permita editar series, repeticiones, descanso y observaciones por ejercicio (no implementado en formulario).

---

## RF06 - Control de Asistencia mediante Código QR

**Requerimiento (PDF):** *El backend validará los códigos QR generados por el frontend o la aplicación móvil. Cada vez que un cliente registre su ingreso mediante QR, se almacenará la fecha, hora y el dispositivo. El sistema evitará códigos duplicados o expirados.*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Generar/mostrar QR para cliente | ✅ Cumple | Dashboard cliente: código QR con identificador (ej. `IRON_` + id_usuario) para que el cliente lo muestre en el acceso. |
| Validar ingreso por QR (front) | ✅ Cumple | Kiosko (`kiosko.tsx`): entrada por ID (simulando escaneo); POST `/accesos/escanear/{idUsuario}`. Asistencia (`(tabs)/asistencia.tsx`): simulador torniquete con API real o mock. |
| Registro entrada/salida | ✅ Cumple | `asistenciaService.escanear(idUsuario)`; backend responde ENTRADA/SALIDA y mensaje; la UI muestra resultado (overlay kiosko, estado en asistencia). |
| Fecha, hora, dispositivo | ✅ Backend | El PDF asigna esto al backend; el front solo envía idUsuario. Cumple en tanto el front usa el endpoint que permite al backend registrar esos datos. |

**Veredicto RF06:** **Cumple** (generación de QR en cliente, validación/escaneo en kiosko/recepción, uso del API de accesos).

---

## RF07 - Gestión de Pagos y Facturación

**Requerimiento (PDF):** *El sistema registrará los pagos realizados por los clientes, generará comprobantes y controlará el estado de las membresías activas o vencidas. Permitirá la integración futura con facturación electrónica.*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Registrar pagos | ✅ Cumple | Catálogo: ventas con POST `/ventas/` (`ventas.service.procesar`). Dashboard admin: pestaña Pagos muestra historial pero con **datos mock** (no hay GET de pagos en el front). |
| Comprobantes | ⚠️ Backend | Generación de comprobantes es responsabilidad del backend; el front solo confirma la venta. No hay pantalla de "descargar comprobante" ni endpoint de comprobante en `api.config`. |
| Estado membresías | ✅ Cumple | Dashboard cliente: estado Activo/Vencido, fecha vencimiento (API dashboard). Detalle cliente y listas muestran estado (parte mock). |
| Facturación electrónica | - | Integración futura; no aplica validación funcional actual. |

**Veredicto RF07:** **Cumple** en registro de ventas y estado de membresía en cliente. **Parcial** en historial de pagos en admin (mock) y en descarga/visualización de comprobantes (no implementado en front).

---

## RF08 - Reportes Administrativos

**Requerimiento (PDF):** *El backend generará reportes detallados en formatos PDF o CSV, con métricas de asistencia, ingresos, rutinas activas, desempeño de entrenadores y estado de membresías. Los reportes podrán ser consultados por usuarios con permisos administrativos.*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Consultar reportes (admin) | ❌ No cumple | No existe en el frontend ninguna pantalla ni flujo para "Reportes" o "Descargar PDF/CSV". Dashboard admin tiene Resumen (métricas desde API), Pagos y Logs con datos **mock**, pero no descarga de reportes generados por el backend. |
| Métricas en dashboard | ✅ Cumple | Admin: total clientes, entrenadores, ingresos (GET `/auth/admin/dashboard`). El resto de visualizaciones (pagos, logs) son mock. |

**Veredicto RF08:** **No cumple** en cuanto a "consultar reportes en PDF o CSV" desde el frontend. **Cumple** en mostrar métricas básicas del dashboard admin vía API.

---

## RF09 - Registro de Accesos al Sistema

**Requerimiento (PDF):** *Cada inicio de sesión será registrado junto con la hora, IP y tipo de dispositivo, permitiendo auditorías de seguridad y control de uso.*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Registro en backend | ✅ Backend | El PDF lo asigna al backend; el front solo hace login. |
| Visualización en front (admin) | ⚠️ Parcial | Dashboard admin: pestaña "Accesos" / "Logs" muestra "Últimos Accesos al Sistema" y lista de logs con usuario, rol, IP, dispositivo, fecha/hora; datos actualmente **MOCK_LOGS_ACCESO**. No hay consumo de un endpoint de logs de acceso en `api.config`. |

**Veredicto RF09:** **Cumple** en que el front permite login (el backend puede registrar). **Parcial** en visualización: la UI existe pero con datos mock; falta un endpoint y su consumo para listar logs de acceso reales.

---

## RF10 - API REST para Comunicación con Frontend

**Requerimiento (PDF):** *Todos los servicios del backend estarán disponibles a través de una API REST estructurada, usando JSON para el intercambio de datos. La API incluirá endpoints para cada módulo y seguirá convenciones RESTful (GET, POST, PUT, DELETE).*

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Consumo API REST | ✅ Cumple | `api.client.ts` con `get`, `post`, `put`, `delete`; base URL y timeout configurados; JSON en headers y body. |
| Endpoints por módulo | ✅ Cumple | Auth, Usuarios, Clientes, Entrenadores (dashboard, rutinas, agenda), Productos, Ventas, Accesos definidos en `api.config.ts` y usados en servicios. |
| Convenciones REST | ✅ Cumple | Uso de GET (consultas), POST (crear), PUT (actualizar), DELETE (eliminar) según los servicios. |

**Veredicto RF10:** **Cumple.**

---

## Resumen

| RF | Veredicto | Observación principal |
|----|-----------|------------------------|
| RF01 | ✅ Cumple | Gestión de usuarios y roles cubierta. |
| RF02 | ✅ Cumple | Login y autorización por rol; token en headers depende del backend. |
| RF03 | ⚠️ Parcial | Pagos y edición detalle cliente en mock o sin flujo completo. |
| RF04 | ⚠️ Parcial | Falta vista "Agenda del día" para entrenador (el endpoint existe). |
| RF05 | ✅ Cumple | Crear/editar/eliminar rutinas y vista cliente; detalle series/repos en formulario es parcial. |
| RF06 | ✅ Cumple | QR cliente, escaneo kiosko/recepción, API accesos. |
| RF07 | ⚠️ Parcial | Ventas OK; historial pagos admin y comprobantes no conectados o no implementados. |
| RF08 | ❌ No cumple | No hay consulta/descarga de reportes PDF/CSV en el front. |
| RF09 | ⚠️ Parcial | UI de logs existe con datos mock; falta endpoint y consumo real. |
| RF10 | ✅ Cumple | Uso consistente de API REST y JSON. |

**Recomendaciones prioritarias para alinear al 100% con el PDF (frontend):**

1. **RF08:** Añadir módulo "Reportes" en el dashboard admin con llamadas a endpoints de reportes (PDF/CSV) del backend y descarga o visualización.
2. **RF09:** Definir y consumir un endpoint de "logs de acceso" y alimentar la pestaña Accesos/Logs con datos reales.
3. **RF04:** Añadir pestaña o vista "Agenda del día" en el dashboard del entrenador usando `entrenadoresService.getAgenda(idUsuario)`.
4. **RF03/RF07:** Sustituir mock de pagos en admin por consumo de API de pagos (si el backend lo expone) y, si aplica, pantalla o enlace para comprobantes.
5. **RF05:** Si el RF exige editar series, repeticiones, descanso y observaciones desde el front, extender el formulario de rutinas y el DTO hacia el backend.
