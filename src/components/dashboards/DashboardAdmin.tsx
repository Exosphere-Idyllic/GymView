// src/components/dashboards/DashboardAdmin.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import Colors from '../../theme/colors';
import { useAuth } from '../../store/AuthContext';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import authService, { AdminDashboardResponse, AdminUsuario } from '../../services/auth.service';
import pagosService, { Pago } from '../../services/pagos.service';
import membresiaService, { PLANES_MEMBRESIA } from '../../services/membresia.service';
import reportesService, { ReporteAsistencia, ReporteIngresos, ReporteRutinas } from '../../services/reportes.service';
import productosService, { Producto } from '../../services/productos.service';
import cuentasBancariasService, { CuentaBancaria } from '../../services/cuentasBancarias.service';
import apiClient from '../../services/api.client';
import { API_CONFIG } from '../../config/api.config';

type Tab = 'resumen' | 'clientes' | 'entrenadores' | 'pagos' | 'logs' | 'usuarios' | 'entrenamientos' | 'reportes' | 'tienda';

export default function DashboardAdmin() {
    const [activeTab, setActiveTab] = useState<Tab>('resumen');
    const { user, logout } = useAuth();
    const router = useRouter();

    // ── Estado API ─────────────────────────────────────────────
    const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
    const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
    const [clientes, setClientes] = useState<AdminUsuario[]>([]);
    const [entrenadores, setEntrenadores] = useState<AdminUsuario[]>([]);
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [loadingPagos, setLoadingPagos] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);
    // ── Estado Modal Crear/Editar usuario ──────────────────────
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUsuario | null>(null);
    const [formUsuario, setFormUsuario] = useState({
        nombre: '', apellido: '', usuario: '', contrasena: '', idRol: 4,
        email: '', telefono: '', cedula: '', fechaNacimiento: '', idEntrenador: null as number | null
    });
    const [savingUser, setSavingUser] = useState(false);

    // ── Estado Modal Membresía ──────────────────────────────────
    const [modalMembresia, setModalMembresia] = useState(false);
    const [clienteMembresia, setClienteMembresia] = useState<AdminUsuario | null>(null);
    const [savingMembresia, setSavingMembresia] = useState(false);

    // ── Estado Comprobante ──────────────────────────────────────
    const [modalComprobante, setModalComprobante] = useState(false);
    const [comprobanteData, setComprobanteData] = useState<any | null>(null);
    const [loadingComprobante, setLoadingComprobante] = useState(false);

    // ── Estado Tab Entrenamientos ──────────────────────────────
    const [selectedEntrenadorTab, setSelectedEntrenadorTab] = useState<AdminUsuario | null>(null);
    const [draftAssignments, setDraftAssignments] = useState<Record<number, boolean>>({});
    const [isSavingAssignments, setIsSavingAssignments] = useState(false);

    // ── Estado Cuentas Bancarias ─────────────────────────────────
    const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>([]);
    const [loadingCuentas, setLoadingCuentas] = useState(false);
    const [formCuenta, setFormCuenta] = useState({ nombreBanco: '', numeroCuenta: '', tipoCuenta: 'Ahorros', titular: 'Iron Fitness S.A.' });
    const [mostrarFormCuenta, setMostrarFormCuenta] = useState(false);
    const [savingCuenta, setSavingCuenta] = useState(false);

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'resumen', label: 'Resumen', icon: '📊' },
        { key: 'usuarios', label: 'Usuarios', icon: '🛡️' },
        { key: 'clientes', label: 'Clientes', icon: '👥' },
        { key: 'entrenamientos', label: 'Entrenamientos', icon: '💪' },
        { key: 'tienda', label: 'Inventario', icon: '📦' },
        { key: 'pagos', label: 'Pagos', icon: '💰' },
        { key: 'logs', label: 'Accesos', icon: '🔐' },
        { key: 'reportes', label: 'Reportes', icon: '📈' },
    ];

    // ── Estado Reportes ─────────────────────────────────────────
    const [reportesAsistencia, setReportesAsistencia] = useState<ReporteAsistencia[]>([]);
    const [reportesIngresos, setReportesIngresos] = useState<ReporteIngresos[]>([]);
    const [reportesRutinasList, setReportesRutinasList] = useState<ReporteRutinas[]>([]);
    const [loadingReportes, setLoadingReportes] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // ── Estado Tienda/Productos ────────────────────────────────
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const [modalProducto, setModalProducto] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
    const [savingProducto, setSavingProducto] = useState(false);
    const [formProducto, setFormProducto] = useState({
        nombre: '', descripcion: '', precio: '0', tipo: 'Tienda', imagenUrl: '', imagenBase64: ''
    });

    const pickImageProducto = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const base64Str = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
            setFormProducto(prev => ({
                ...prev,
                imagenBase64: base64Str
            }));
        }
    };

    // ── Cargar stats ───────────────────────────────────────────
    const cargarStats = useCallback(async () => {
        setLoadingStats(true);
        setApiError(null);
        try {
            const data = await authService.getAdminDashboard();
            setStats(data);
        } catch (e: any) {
            setApiError(e.message || 'Error de conexión');
            setStats(null);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    const cargarUsuarios = useCallback(async () => {
        setLoadingUsuarios(true);
        try {
            const data = await authService.getUsuariosAdmin();
            setUsuarios(data);
        } catch (e: any) {
            Alert.alert('Aviso', 'No se pudo cargar usuarios del servidor.');
        } finally {
            setLoadingUsuarios(false);
        }
    }, []);

    const cargarClientes = useCallback(async () => {
        setLoadingClientes(true);
        try {
            // Reutilizamos el endpoint de listado de usuarios filtrando rol cliente
            const data = await authService.getUsuariosAdmin();
            setClientes(data.filter(u => u.rol === 'Cliente'));
        } catch (e: any) {
            Alert.alert('Aviso', 'No se pudo cargar clientes.');
        } finally {
            setLoadingClientes(false);
        }
    }, []);

    const cargarEntrenadores = useCallback(async () => {
        try {
            const data = await authService.getUsuariosAdmin();
            setEntrenadores(data.filter(u => u.rol === 'Entrenador' && u.activo));
        } catch (e: any) {
            console.error('Error cargando entrenadores:', e);
        }
    }, []);

    const cargarPagos = useCallback(async () => {
        setLoadingPagos(true);
        try {
            const data = await pagosService.getAll();
            setPagos(data);
        } catch (e: any) {
            Alert.alert('Error', 'No se pudieron cargar los pagos');
        } finally {
            setLoadingPagos(false);
        }
    }, []);

    // ── Ver Comprobante ───────────────────────────────────────
    const verComprobante = async (idFactura: number) => {
        setComprobanteData(null);
        setLoadingComprobante(true);
        setModalComprobante(true);
        try {
            const data = await pagosService.getComprobante(idFactura);
            setComprobanteData(data);
        } catch (e: any) {
            Alert.alert('Error', 'No se pudo cargar el comprobante');
            setModalComprobante(false);
        } finally {
            setLoadingComprobante(false);
        }
    };

    const cargarLogs = useCallback(async () => {
        setLoadingLogs(true);
        try {
            const data = await apiClient.get<any[]>(API_CONFIG.ENDPOINTS.LOGS.ACCESOS);
            setLogs(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setLogs([]);
        } finally {
            setLoadingLogs(false);
        }
    }, []);

    const cargarReportes = useCallback(async () => {
        setLoadingReportes(true);
        try {
            const [asistencias, ingresos, rutinas] = await Promise.all([
                reportesService.getAsistencia(),
                reportesService.getIngresos(),
                reportesService.getRutinas()
            ]);
            setReportesAsistencia(Array.isArray(asistencias) ? asistencias : []);
            setReportesIngresos(Array.isArray(ingresos) ? ingresos : []);
            setReportesRutinasList(Array.isArray(rutinas) ? rutinas : []);
        } catch (e: any) {
            console.error('Error cargando reportes:', e);
            Alert.alert('Error', 'No se pudieron cargar los reportes completos');
        } finally {
            setLoadingReportes(false);
        }
    }, []);

    const cargarProductos = useCallback(async () => {
        setLoadingProductos(true);
        try {
            const data = await productosService.listar();
            setProductos(data);
        } catch (e: any) {
            Alert.alert('Error', 'No se pudo cargar el inventario.');
        } finally {
            setLoadingProductos(false);
        }
    }, []);

    const cargarCuentas = useCallback(async () => {
        setLoadingCuentas(true);
        try {
            const data = await cuentasBancariasService.listarTodas();
            setCuentasBancarias(data);
        } catch (e: any) {
            setCuentasBancarias([]);
        } finally {
            setLoadingCuentas(false);
        }
    }, []);

    useEffect(() => {
        cargarStats();
        cargarLogs();
    }, []);

    useEffect(() => {
        if (activeTab === 'usuarios') cargarUsuarios();
        if (activeTab === 'clientes') cargarClientes();
        if (activeTab === 'entrenamientos') {
            cargarEntrenadores();
            cargarClientes();
        }
        if (activeTab === 'tienda') cargarProductos();
        if (activeTab === 'pagos') { cargarPagos(); cargarCuentas(); }
        if (activeTab === 'logs') cargarLogs();
        if (activeTab === 'reportes') cargarReportes();
    }, [activeTab]);

    const generarCSVContent = (tipo: 'ingresos' | 'asistencia' | 'rutinas'): string => {
        let csv = '';
        if (tipo === 'ingresos') {
            csv = 'Periodo,Ventas,Total Recaudado\n';
            reportesIngresos.forEach(ing => {
                csv += `"${new Date(ing.fecha).toLocaleDateString('es')}","${ing.cantidadVentas}","${typeof ing.totalIngresos === 'number' ? ing.totalIngresos.toFixed(2) : ing.totalIngresos}"\n`;
            });
        } else if (tipo === 'asistencia') {
            csv = 'Fecha,Total Ingresos,Clientes Unicos\n';
            reportesAsistencia.forEach(asis => {
                csv += `"${new Date(asis.fecha).toLocaleDateString('es')}","${asis.totalAsistencias}","${asis.clientesUnicos}"\n`;
            });
        } else if (tipo === 'rutinas') {
            csv = 'Rutina,Entrenador,Alumnos Asignados,Estado\n';
            reportesRutinasList.forEach(rut => {
                csv += `"${rut.nombreRutina}","${rut.entrenador || 'N/A'}","${rut.alumnosAsignados}","${rut.activa ? 'Activa' : 'Inactiva'}"\n`;
            });
        }
        return csv;
    };

    const exportarCSV = (tipo: 'ingresos' | 'asistencia' | 'rutinas') => {
        const csvContent = generarCSVContent(tipo);
        if (!csvContent) return;

        try {
            if (Platform.OS === 'web') {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `reporte_${tipo}_${new Date().getTime()}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                Alert.alert('Éxito', 'Reporte CSV descargado correctamente.');
            } else {
                // Para simplificar, en móvil mostraremos el CSV o usaríamos expo-file-system en el futuro.
                Alert.alert('Info', 'La exportación directa de archivos actualmente está soportada principalmente en web. Se integrará módulo nativo próximamente.');
            }
        } catch (err) {
            console.error('Error al exportar CSV', err);
            Alert.alert('Error', 'No se pudo generar el archivo CSV.');
        }
    };

    // ── Acciones usuario ───────────────────────────────────────
    const abrirModalCrear = () => {
        setEditingUser(null);
        setFormUsuario({
            nombre: '', apellido: '', usuario: '', contrasena: '', idRol: 4,
            email: '', telefono: '', cedula: '', fechaNacimiento: '', idEntrenador: null
        });
        setModalVisible(true);
    };

    const abrirModalEditar = (u: AdminUsuario) => {
        setEditingUser(u);
        setFormUsuario({
            nombre: u.nombre, apellido: u.apellido, usuario: u.usuario, contrasena: '', idRol: rolNameToId(u.rol),
            email: u.email || '', telefono: u.telefono || '', cedula: u.cedula || '', fechaNacimiento: u.fechaNacimiento?.split('T')[0] || '',
            idEntrenador: u.idEntrenador || null
        });
        setModalVisible(true);
    };

    const guardarUsuario = async () => {
        if (!formUsuario.nombre || !formUsuario.usuario) {
            Alert.alert('Error', 'Nombre y usuario son obligatorios');
            return;
        }
        setSavingUser(true);
        try {
            if (editingUser) {
                await authService.editarUsuarioAdmin(editingUser.id, formUsuario);
                Alert.alert('✅ Éxito', 'Usuario actualizado correctamente');
            } else {
                if (!formUsuario.contrasena) {
                    Alert.alert('Error', 'La contraseña es obligatoria');
                    setSavingUser(false);
                    return;
                }
                await authService.crearUsuarioAdmin(formUsuario);
                Alert.alert('✅ Éxito', 'Usuario creado correctamente');
            }
            setModalVisible(false);
            cargarUsuarios();
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo guardar');
        } finally {
            setSavingUser(false);
        }
    };

    const cambiarEstado = async (u: AdminUsuario) => {
        const title = u.activo ? 'Desactivar usuario' : 'Activar usuario';
        const msg = `¿Estás seguro de ${u.activo ? 'desactivar' : 'activar'} a ${u.usuario}?`;

        const doAction = async () => {
            try {
                await authService.cambiarEstadoUsuario(u.id, !u.activo);
                if (activeTab === 'usuarios') cargarUsuarios();
                else if (activeTab === 'clientes') cargarClientes();
            } catch (e: any) {
                Alert.alert('Error', e.message);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(msg)) {
                doAction();
            }
        } else {
            Alert.alert(title, msg, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: doAction }
            ]);
        }
    };

    const handleSelectEntrenador = (e: AdminUsuario) => {
        setSelectedEntrenadorTab(e);
        const initialDraft: Record<number, boolean> = {};
        clientes.forEach(c => {
            initialDraft[c.id] = c.idEntrenador === e.id;
        });
        setDraftAssignments(initialDraft);
    };

    const toggleAsignacion = (clienteId: number) => {
        setDraftAssignments(prev => ({
            ...prev,
            [clienteId]: !prev[clienteId]
        }));
    };

    const guardarAsignaciones = async () => {
        if (!selectedEntrenadorTab) return;
        setIsSavingAssignments(true);
        try {
            const changesPromises = clientes.map(async (c) => {
                const wasAssigned = c.idEntrenador === selectedEntrenadorTab.id;
                const isAssignedNow = draftAssignments[c.id] || false;
                if (wasAssigned !== isAssignedNow) {
                    const formData = {
                        nombre: c.nombre,
                        apellido: c.apellido,
                        usuario: c.usuario,
                        idRol: rolNameToId(c.rol),
                        email: c.email || '',
                        telefono: c.telefono || '',
                        cedula: c.cedula || '',
                        fechaNacimiento: c.fechaNacimiento?.split('T')[0] || '',
                        idEntrenador: isAssignedNow ? selectedEntrenadorTab.id : null
                    };
                    return authService.editarUsuarioAdmin(c.id, formData as any).then(() => {
                        c.idEntrenador = isAssignedNow ? selectedEntrenadorTab.id : undefined;
                    });
                }
            });
            await Promise.all(changesPromises);
            Alert.alert('✅ Éxito', 'Asignaciones guardadas correctamente.');
            cargarClientes(); // Reload fresh data
        } catch (e: any) {
            Alert.alert('Error', 'Hubo un problema guardando algunas asignaciones: ' + e.message);
        } finally {
            setIsSavingAssignments(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    // ── Asignar membresía ──────────────────────────────────────
    const abrirModalMembresia = (c: AdminUsuario) => {
        setClienteMembresia(c);
        setModalMembresia(true);
    };

    const asignarMembresia = async (idTipoMembresia: number) => {
        if (!clienteMembresia || !clienteMembresia.id) {
            Alert.alert('Error', 'Este usuario no tiene perfil de cliente aún.');
            return;
        }
        setSavingMembresia(true);
        try {
            await membresiaService.asignar(clienteMembresia.id, idTipoMembresia);
            const plan = PLANES_MEMBRESIA.find(p => p.id === idTipoMembresia);
            Alert.alert('✅ Membresía asignada', `Plan ${plan?.nombre ?? ''} activado.El pago se registró automáticamente.`);
            setModalMembresia(false);
            cargarClientes(); // Refrescar lista para ver la nueva membresía
        } catch (e: any) {
            Alert.alert('Error', e.message || 'No se pudo asignar la membresía');
        } finally {
            setSavingMembresia(false);
        }
    };

    const cancelarMembresia = (c: AdminUsuario) => {
        if (!c.id || !c.membresia) {
            Alert.alert('Aviso', 'Este cliente no tiene una membresía activa.');
            return;
        }

        const msg = `¿Estás seguro de cancelar la membresía "${c.membresia}" de ${c.nombre}?`;

        const doCancel = async () => {
            try {
                await membresiaService.cancelar(c.id);
                Alert.alert('✅ Éxito', 'Membresía cancelada correctamente.');
                cargarClientes();
            } catch (e: any) {
                Alert.alert('Error', e.message || 'No se pudo cancelar la membresía.');
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(msg)) {
                doCancel();
            }
        } else {
            Alert.alert('Cancelar Membresía', msg, [
                { text: 'Volver', style: 'cancel' },
                { text: 'Sí, cancelar', style: 'destructive', onPress: doCancel }
            ]);
        }
    };

    const rolNameToId = (rolName: string): number => {
        const map: Record<string, number> = { Administrador: 1, Recepcionista: 2, Entrenador: 3, Cliente: 4 };
        return map[rolName] || 4;
    };

    const ROL_COLORS: Record<string, string> = {
        Administrador: '#dc3545',
        Recepcionista: '#0dcaf0',
        Entrenador: '#198754',
        Cliente: '#ffc107',
    };

    // ── Stat cards ─────────────────────────────────────────────
    const statCards = [
        { label: 'Total Clientes', value: stats?.totalClientes ?? '…', icon: '👥', color: Colors.primary },
        { label: 'Entrenadores', value: stats?.totalEntrenadores ?? '…', icon: '🏋️', color: '#0dcaf0' },
        { label: 'Ingresos Totales', value: stats ? `$${Number(stats.ingresos).toFixed(2)} ` : '…', icon: '💵', color: Colors.success },
        { label: 'Usuarios Inactivos', value: usuarios.filter(u => !u.activo).length, icon: '⚠️', color: Colors.danger },
    ];

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>⚡ IRON ADMIN</Text>
                    <Text style={styles.headerSub}>
                        {user?.nombre_completo}
                        {apiError ? '  ⚠️ Modo offline' : '  🟢 API conectada'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsBar} contentContainerStyle={{ paddingHorizontal: 12 }}>
                {tabs.map(t => (
                    <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.tabActive]} onPress={() => setActiveTab(t.key)}>
                        <Text style={styles.tabIcon}>{t.icon}</Text>
                        <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30, alignItems: 'center' }}>
              <View style={styles.pageInner}>

                {/* ─── RESUMEN ─── */}
                {activeTab === 'resumen' && (
                    <>
                        {loadingStats && (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color={Colors.primary} size="small" />
                                <Text style={styles.loadingText}>Cargando datos reales...</Text>
                            </View>
                        )}
                        {apiError ? (
                            <View style={styles.warnBox}>
                                <Text style={styles.warnText}>⚠️ {apiError} — mostrando datos de respaldo</Text>
                                <TouchableOpacity onPress={cargarStats}><Text style={{ color: Colors.primary, fontSize: 12, marginTop: 4 }}>🔄 Reintentar</Text></TouchableOpacity>
                            </View>
                        ) : null}
                        <View style={styles.statsGrid}>
                            {statCards.map((s, i) => (
                                <View key={i} style={[styles.statCard, { borderLeftColor: s.color }]}>
                                    <Text style={styles.statIcon}>{s.icon}</Text>
                                    <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                                    <Text style={styles.statLabel}>{s.label}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Últimos Accesos al Sistema</Text>
                        {logs.slice(0, 4).map((log, i) => (
                            <View key={log.idLog ?? i} style={styles.logRow}>
                                <View style={styles.logAvatar}><Text style={styles.logAvatarText}>{(log.usuario ?? '??').substring(0, 2).toUpperCase()}</Text></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.logUser}>{log.usuario} <Text style={styles.logRol}>({log.rol})</Text></Text>
                                    <Text style={styles.logDetail}>{log.exitoso ? '✅ Exitoso' : '❌ Fallido'}</Text>
                                </View>
                                {log.fechaHora ? (
                                    <Text style={styles.logTime}>
                                        {new Date(log.fechaHora).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                ) : null}
                            </View>
                        ))}
                    </>
                )}

                {/* ─── USUARIOS (API REAL) ─── */}
                {activeTab === 'usuarios' && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Gestión de Usuarios</Text>
                            <TouchableOpacity style={styles.addBtn} onPress={abrirModalCrear}>
                                <Text style={styles.addBtnText}>+ Nuevo</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingUsuarios ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color={Colors.primary} />
                                <Text style={styles.loadingText}>Cargando usuarios...</Text>
                            </View>
                        ) : usuarios.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No hay usuarios registrados</Text>
                                <TouchableOpacity onPress={cargarUsuarios}><Text style={{ color: Colors.primary, marginTop: 8 }}>🔄 Recargar</Text></TouchableOpacity>
                            </View>
                        ) : (
                            usuarios.map(u => (
                                <View key={u.id} style={styles.card}>
                                    <View style={styles.cardRow}>
                                        <View style={[styles.avatar, { backgroundColor: u.activo ? '#1565C0' : '#555' }]}>
                                            <Text style={styles.avatarText}>{u.usuario.substring(0, 2).toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.cardName}>{u.nombre} {u.apellido}</Text>
                                            <Text style={styles.cardSub}>@{u.usuario}</Text>
                                        </View>
                                        <View style={[styles.badge, { backgroundColor: ROL_COLORS[u.rol] || '#555' }]}>
                                            <Text style={styles.badgeText}>{u.rol}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View style={[styles.estadoBadge, { backgroundColor: u.activo ? Colors.success : Colors.danger }]}>
                                            <Text style={styles.badgeText}>{u.activo ? '✅ Activo' : '❌ Inactivo'}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            <TouchableOpacity onPress={() => abrirModalEditar(u)}>
                                                <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>✏️ Editar</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => cambiarEstado(u)}>
                                                <Text style={{ color: u.activo ? Colors.danger : Colors.success, fontSize: 13, fontWeight: '600' }}>
                                                    {u.activo ? '🚫 Desactivar' : '✅ Activar'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}

                {/* ─── CLIENTES ─── */}
                {activeTab === 'clientes' && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Gestión de Clientes</Text>
                        </View>
                        {loadingClientes ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color={Colors.primary} />
                                <Text style={styles.loadingText}>Cargando clientes...</Text>
                            </View>
                        ) : clientes.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No hay clientes registrados</Text>
                                <TouchableOpacity onPress={cargarClientes}><Text style={{ color: Colors.primary, marginTop: 8 }}>🔄 Recargar</Text></TouchableOpacity>
                            </View>
                        ) : (
                            clientes.map(c => (
                                <View key={c.id} style={styles.card}>
                                    <View style={styles.cardRow}>
                                        <View style={[styles.avatar, { backgroundColor: c.activo ? Colors.primary : '#555' }]}>
                                            <Text style={styles.avatarText}>{(c.nombre ?? '?')[0]}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.cardName}>{c.nombre} {c.apellido}</Text>
                                            <Text style={styles.cardSub}>@{c.usuario}</Text>
                                            {c.membresia ? (
                                                <Text style={{ color: Colors.primary, fontSize: 11, marginTop: 2 }}>
                                                    📋 {c.membresia}{c.fechaVencimiento ? ` · Vence: ${c.fechaVencimiento} ` : null}
                                                </Text>
                                            ) : (
                                                <Text style={{ color: Colors.danger, fontSize: 11, marginTop: 2 }}>⚠️ Sin membresía activa</Text>
                                            )}
                                        </View>
                                        <View style={[styles.estadoBadge, { backgroundColor: c.activo ? Colors.success : Colors.danger }]}>
                                            <Text style={styles.badgeText}>{c.activo ? '✅ Activo' : '❌ Inactivo'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            <TouchableOpacity onPress={() => abrirModalMembresia(c)}>
                                                <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>🎫 Asignar</Text>
                                            </TouchableOpacity>
                                            {c.membresia ? (
                                                <TouchableOpacity onPress={() => cancelarMembresia(c)}>
                                                    <Text style={{ color: Colors.warning, fontSize: 13, fontWeight: '600' }}>❌ Cancelar Mem.</Text>
                                                </TouchableOpacity>
                                            ) : null}
                                        </View>
                                        <TouchableOpacity onPress={() => cambiarEstado(c)}>
                                            <Text style={{ color: c.activo ? Colors.danger : Colors.success, fontSize: 13, fontWeight: '600' }}>
                                                {c.activo ? '🚫 Desactivar' : '✅ Activar'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}

                {/* ─── ENTRENAMIENTOS (Asignaciones) ─── */}
                {activeTab === 'entrenamientos' && (
                    <View style={{ flex: 1, minHeight: 500 }}>
                        <Text style={styles.sectionTitle}>Asignación de Alumnos a Entrenadores</Text>
                        <View style={{ flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 16 }}>
                            {/* Columna Izquierda: Entrenadores */}
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: Colors.text }}>Selecciona un Entrenador:</Text>
                                {entrenadores.length === 0 ? (
                                    <Text style={styles.emptyText}>No hay entrenadores activos.</Text>
                                ) : (
                                    entrenadores.map(e => (
                                        <TouchableOpacity
                                            key={e.id}
                                            style={[styles.card, selectedEntrenadorTab?.id === e.id && { borderColor: Colors.primary, borderWidth: 2 }]}
                                            onPress={() => handleSelectEntrenador(e)}
                                        >
                                            <View style={styles.cardRow}>
                                                <View style={[styles.avatar, { backgroundColor: Colors.primary }]}><Text style={styles.avatarText}>{(e.nombre ?? '?')[0]}</Text></View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.cardName}>{e.nombre} {e.apellido}</Text>
                                                    <Text style={styles.cardSub}>@{e.usuario}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>

                            {/* Columna Derecha: Clientes del Entrenador Seleccionado */}
                            <View style={{ flex: 1.5 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 10 }}>
                                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: Colors.text }}>
                                        {selectedEntrenadorTab ? `Alumnos de ${selectedEntrenadorTab.nombre}` : 'Selecciona un entrenador primero'}
                                    </Text>
                                    {selectedEntrenadorTab && (
                                        <TouchableOpacity 
                                            style={{ backgroundColor: isSavingAssignments ? '#999' : Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 }}
                                            onPress={guardarAsignaciones}
                                            disabled={isSavingAssignments}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                                {isSavingAssignments ? 'Guardando...' : '💾 Guardar Cambios'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {selectedEntrenadorTab ? (
                                    clientes.length === 0 ? (
                                        <Text style={styles.emptyText}>No hay clientes registrados.</Text>
                                    ) : (
                                        <ScrollView style={{ maxHeight: 600 }}>
                                            <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: Colors.primary }}>✅ Asignados</Text>
                                            {clientes.filter(c => draftAssignments[c.id]).map(c => (
                                                <TouchableOpacity
                                                    key={c.id}
                                                    style={[styles.card, { paddingVertical: 10, paddingHorizontal: 12, borderColor: Colors.primary, borderWidth: 1 }]}
                                                    onPress={() => toggleAsignacion(c.id)}
                                                >
                                                    <View style={[styles.cardRow, { alignItems: 'center' }]}>
                                                        <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Colors.primary, backgroundColor: Colors.primary, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.cardName}>{c.nombre} {c.apellido}</Text>
                                                            <Text style={[styles.cardSub, { fontSize: 11 }]}>{c.membresia ? `📋 ${c.membresia}` : '⚠️ Sin membresía'}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}

                                            <Text style={{ fontWeight: 'bold', marginTop: 20, marginBottom: 5, color: '#666' }}>Disponibles</Text>
                                            {clientes.filter(c => !draftAssignments[c.id]).map(c => (
                                                <TouchableOpacity
                                                    key={c.id}
                                                    style={[styles.card, { paddingVertical: 10, paddingHorizontal: 12, opacity: 0.8 }]}
                                                    onPress={() => toggleAsignacion(c.id)}
                                                >
                                                    <View style={[styles.cardRow, { alignItems: 'center' }]}>
                                                        <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ccc', backgroundColor: 'transparent', marginRight: 10, alignItems: 'center', justifyContent: 'center' }} />
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.cardName}>{c.nombre} {c.apellido}</Text>
                                                            <Text style={[styles.cardSub, { fontSize: 11 }]}>
                                                                {c.membresia ? `📋 ${c.membresia}` : '⚠️ Sin membresía'}
                                                                {c.idEntrenador && c.idEntrenador !== selectedEntrenadorTab.id ? ` · 🏋️ Asignado a otro entrenador` : ''}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )
                                ) : (
                                    <View style={styles.emptyBox}>
                                        <Text style={styles.emptyText}>👈 Haz clic en un entrenador</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* ─── INVENTARIO / TIENDA ─── */}
                {activeTab === 'tienda' && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Inventario de Tienda</Text>
                            <TouchableOpacity style={styles.addBtn} onPress={() => {
                                setEditingProduct(null);
                                setFormProducto({ nombre: '', descripcion: '', precio: '0', tipo: 'Tienda', imagenUrl: '', imagenBase64: '' });
                                setModalProducto(true);
                            }}>
                                <Text style={styles.addBtnText}>+ Nuevo Producto</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingProductos ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color={Colors.primary} />
                                <Text style={styles.loadingText}>Cargando inventario...</Text>
                            </View>
                        ) : productos.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No hay productos registrados</Text>
                                <TouchableOpacity onPress={cargarProductos}><Text style={{ color: Colors.primary, marginTop: 8 }}>🔄 Recargar</Text></TouchableOpacity>
                            </View>
                        ) : (
                            productos.map(p => (
                                <View key={p.idProducto || p.id} style={styles.card}>
                                    <View style={styles.cardRow}>
                                        <View style={[styles.avatar, { backgroundColor: '#333', overflow: 'hidden' }]}>
                                            {p.imagenUrl ? (
                                                <img src={p.imagenUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="prod" />
                                            ) : (
                                                <Text style={styles.avatarText}>📦</Text>
                                            )}
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={styles.cardName}>{p.nombre}</Text>
                                            <Text style={styles.cardSub} numberOfLines={2}>{p.descripcion || 'Sin descripción'}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={[styles.cardName, { color: Colors.success }]}>${Number(p.precio).toFixed(2)}</Text>
                                            <View style={[styles.badge, { backgroundColor: '#444', marginTop: 4 }]}>
                                                <Text style={[styles.badgeText, { fontSize: 10 }]}>{p.tipo}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={[styles.cardFooter, { justifyContent: 'flex-end', gap: 15 }]}>
                                        <TouchableOpacity onPress={() => {
                                            setEditingProduct(p);
                                            setFormProducto({
                                                nombre: p.nombre,
                                                descripcion: p.descripcion,
                                                precio: p.precio.toString(),
                                                tipo: p.tipo,
                                                imagenUrl: p.imagenUrl || '',
                                                imagenBase64: ''
                                            });
                                            setModalProducto(true);
                                        }}>
                                            <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>✏️ Editar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => {
                                            const execDelete = async () => {
                                                try {
                                                    await productosService.delete(p.idProducto || p.id!);
                                                    Alert.alert('✅ Éxito', 'Producto eliminado');
                                                    cargarProductos();
                                                } catch(e:any) {
                                                    Alert.alert('Error', e.message || 'No se pudo eliminar');
                                                }
                                            };
                                            if (Platform.OS === 'web') {
                                                if (window.confirm(`¿Eliminar ${p.nombre}?`)) execDelete();
                                            } else {
                                                Alert.alert('Eliminar', `¿Eliminar ${p.nombre}?`, [
                                                    {text: 'Cancelar', style: 'cancel'},
                                                    {text: 'Eliminar', style: 'destructive', onPress: execDelete}
                                                ]);
                                            }
                                        }}>
                                            <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: '600' }}>🗑️ Eliminar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}

                {/* ─── PAGOS ─── */}
                {activeTab === 'pagos' && (
                    <>
                        <Text style={styles.sectionTitle}>Historial de Pagos</Text>
                        {loadingPagos ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color={Colors.primary} />
                                <Text style={styles.loadingText}>Cargando pagos...</Text>
                            </View>
                        ) : pagos.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No hay pagos registrados</Text>
                                <TouchableOpacity onPress={cargarPagos}><Text style={{ color: Colors.primary, marginTop: 8 }}>🔄 Recargar</Text></TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View style={[styles.statCard, { borderLeftColor: Colors.success, marginBottom: 16 }]}>
                                    <Text style={styles.statLabel}>Total Recaudado</Text>
                                    <Text style={[styles.statValue, { color: Colors.success }]}>
                                        ${pagos.reduce((a, p) => a + (p.monto ?? 0), 0).toFixed(2)}
                                    </Text>
                                </View>
                                {pagos.map((p, i) => (
                                    <View key={p.idPago ?? i} style={styles.card}>
                                        <View style={styles.cardRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cardName}>{p.nombreCliente} {p.apellidoCliente}</Text>
                                                <Text style={styles.cardSub}>{p.metodoPago ?? 'Pago'} · {p.fechaPago?.substring(0, 10)}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.statValue, { color: Colors.success, fontSize: 20 }]}>${p.monto}</Text>
                                                {p.idFactura && (
                                                    <TouchableOpacity style={{ marginTop: 4, padding: 4, backgroundColor: '#333', borderRadius: 4 }} onPress={() => verComprobante(p.idFactura!)}>
                                                        <Text style={{ color: '#fff', fontSize: 12 }}>📄 Comprobante</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                        {p.observaciones ? <Text style={styles.logDetail}>📝 {p.observaciones}</Text> : null}
                                    </View>
                                ))}
                            </>
                        )}

                        {/* ── Sección Cuentas Bancarias ── */}
                        <View style={{ marginTop: 28 }}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>🏦 Cuentas Bancarias</Text>
                                <TouchableOpacity style={styles.addBtn} onPress={() => setMostrarFormCuenta(!mostrarFormCuenta)}>
                                    <Text style={styles.addBtnText}>{mostrarFormCuenta ? 'Cancelar' : '+ Nueva Cuenta'}</Text>
                                </TouchableOpacity>
                            </View>

                            {mostrarFormCuenta && (
                                <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: Colors.primary }]}>
                                    <TextInput style={styles.feInput} placeholder="Nombre del Banco" placeholderTextColor={Colors.textMuted}
                                        value={formCuenta.nombreBanco} onChangeText={v => setFormCuenta(p => ({ ...p, nombreBanco: v }))} />
                                    <TextInput style={styles.feInput} placeholder="Número de Cuenta" placeholderTextColor={Colors.textMuted}
                                        value={formCuenta.numeroCuenta} onChangeText={v => setFormCuenta(p => ({ ...p, numeroCuenta: v }))} />
                                    <TextInput style={styles.feInput} placeholder="Tipo (Ahorros / Corriente)" placeholderTextColor={Colors.textMuted}
                                        value={formCuenta.tipoCuenta} onChangeText={v => setFormCuenta(p => ({ ...p, tipoCuenta: v }))} />
                                    <TextInput style={styles.feInput} placeholder="Titular" placeholderTextColor={Colors.textMuted}
                                        value={formCuenta.titular} onChangeText={v => setFormCuenta(p => ({ ...p, titular: v }))} />
                                    <TouchableOpacity
                                        style={[styles.addBtn, { alignSelf: 'flex-end', marginTop: 8, opacity: savingCuenta ? 0.6 : 1 }]}
                                        disabled={savingCuenta}
                                        onPress={async () => {
                                            if (!formCuenta.nombreBanco || !formCuenta.numeroCuenta) {
                                                Alert.alert('Error', 'Banco y número de cuenta son obligatorios');
                                                return;
                                            }
                                            setSavingCuenta(true);
                                            try {
                                                await cuentasBancariasService.crear(formCuenta);
                                                Alert.alert('✅', 'Cuenta bancaria registrada');
                                                setFormCuenta({ nombreBanco: '', numeroCuenta: '', tipoCuenta: 'Ahorros', titular: 'Iron Fitness S.A.' });
                                                setMostrarFormCuenta(false);
                                                const data = await cuentasBancariasService.listarTodas();
                                                setCuentasBancarias(data);
                                            } catch (e: any) {
                                                Alert.alert('Error', e.message || 'No se pudo crear la cuenta');
                                            } finally {
                                                setSavingCuenta(false);
                                            }
                                        }}
                                    >
                                        <Text style={styles.addBtnText}>{savingCuenta ? 'Guardando...' : '💾 Guardar'}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {loadingCuentas ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator color={Colors.primary} />
                                    <Text style={styles.loadingText}>Cargando cuentas...</Text>
                                </View>
                            ) : cuentasBancarias.length === 0 ? (
                                <View style={styles.emptyBox}>
                                    <Text style={styles.emptyText}>No hay cuentas bancarias registradas</Text>
                                    <TouchableOpacity onPress={async () => {
                                        setLoadingCuentas(true);
                                        try { setCuentasBancarias(await cuentasBancariasService.listarTodas()); } catch(e) {}
                                        finally { setLoadingCuentas(false); }
                                    }}>
                                        <Text style={{ color: Colors.primary, marginTop: 8 }}>🔄 Recargar</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                cuentasBancarias.map(c => (
                                    <View key={c.idCuenta} style={[styles.card, !c.activa && { opacity: 0.5 }]}>
                                        <View style={styles.cardRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cardName}>🏦 {c.nombreBanco}</Text>
                                                <Text style={styles.cardSub}>Cuenta: {c.numeroCuenta} · {c.tipoCuenta}</Text>
                                                <Text style={[styles.cardSub, { fontSize: 11 }]}>Titular: {c.titular}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={{ padding: 8 }}
                                                onPress={async () => {
                                                    const execDel = async () => {
                                                        try {
                                                            await cuentasBancariasService.eliminar(c.idCuenta);
                                                            Alert.alert('✅', 'Cuenta eliminada');
                                                            setCuentasBancarias(prev => prev.filter(x => x.idCuenta !== c.idCuenta));
                                                        } catch(e:any) {
                                                            Alert.alert('Error', e.message || 'No se pudo eliminar');
                                                        }
                                                    };
                                                    if (Platform.OS === 'web') {
                                                        if (window.confirm(`¿Eliminar cuenta ${c.numeroCuenta}?`)) execDel();
                                                    } else {
                                                        Alert.alert('Eliminar', `¿Eliminar cuenta ${c.numeroCuenta}?`, [
                                                            { text: 'Cancelar', style: 'cancel' },
                                                            { text: 'Eliminar', style: 'destructive', onPress: execDel }
                                                        ]);
                                                    }
                                                }}
                                            >
                                                <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: '600' }}>🗑️</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </>
                )}

                {/* ─── LOGS ─── */}
                {activeTab === 'logs' && (
                    <>
                        <Text style={styles.sectionTitle}>Registro de Accesos</Text>
                        {loadingLogs ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color={Colors.primary} />
                                <Text style={styles.loadingText}>Cargando accesos...</Text>
                            </View>
                        ) : logs.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No hay registros de acceso</Text>
                                <TouchableOpacity onPress={cargarLogs}><Text style={{ color: Colors.primary, marginTop: 8 }}>🔄 Recargar</Text></TouchableOpacity>
                            </View>
                        ) : (
                            logs.map((log, i) => (
                                <View key={log.idLog ?? i} style={styles.card}>
                                    <View style={styles.cardRow}>
                                        <View style={styles.logAvatar}><Text style={styles.logAvatarText}>{(log.usuario ?? '??').substring(0, 2).toUpperCase()}</Text></View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.cardName}>{log.usuario} <Text style={{ color: Colors.primary }}>({log.rol ?? 'usuario'})</Text></Text>
                                            <Text style={styles.cardSub}>{log.exitoso ? '✅ Exitoso' : '❌ Fallido'}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.logDetail}>🕐 {log.fechaHora ? new Date(log.fechaHora).toLocaleString('es') : 'Fecha no disponible'}</Text>
                                </View>
                            ))
                        )}
                    </>
                )}

                {/* ─── REPORTES ADMINISTRATIVOS (RF08) ─── */}
                {activeTab === 'reportes' && (
                    <View style={{ flex: 1, minHeight: 600 }}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Reportes Administrativos</Text>
                            <TouchableOpacity style={styles.addBtn} onPress={cargarReportes}>
                                <Text style={styles.addBtnText}>🔄 Actualizar</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingReportes ? (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
                                <ActivityIndicator color={Colors.primary} size="large" />
                                <Text style={styles.loadingText}>Generando reportes del sistema...</Text>
                            </View>
                        ) : (
                            <>
                                {/* Resumen Financiero */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 8 }}>
                                    <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>💰 Ingresos y Ventas</Text>
                                    <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#333' }]} onPress={() => exportarCSV('ingresos')}>
                                        <Text style={styles.addBtnText}>📥 Exportar</Text>
                                    </TouchableOpacity>
                                </View>
                                {reportesIngresos.length === 0 ? (
                                    <View style={styles.emptyBox}><Text style={styles.emptyText}>Sin datos de ingresos registrados.</Text></View>
                                ) : (
                                    <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
                                        <View style={{ flexDirection: 'row', backgroundColor: '#333', padding: 12 }}>
                                            <Text style={{ flex: 2, color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Periodo</Text>
                                            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Ventas</Text>
                                            <Text style={{ flex: 1.5, color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'right' }}>Total Recaudado</Text>
                                        </View>
                                        {reportesIngresos.map((ing, i) => (
                                            <View key={i} style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: Colors.border }}>
                                                <Text style={{ flex: 2, color: Colors.text }}>{new Date(ing.fecha).toLocaleDateString('es')}</Text>
                                                <Text style={{ flex: 1, color: Colors.text, textAlign: 'center' }}>{ing.cantidadVentas}</Text>
                                                <Text style={{ flex: 1.5, color: Colors.success, fontWeight: 'bold', textAlign: 'right' }}>${typeof ing.totalIngresos === 'number' ? ing.totalIngresos.toFixed(2) : ing.totalIngresos}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Asistencia */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
                                    <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>👥 Flujo de Asistencia</Text>
                                    <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#333' }]} onPress={() => exportarCSV('asistencia')}>
                                        <Text style={styles.addBtnText}>📥 Exportar</Text>
                                    </TouchableOpacity>
                                </View>
                                {reportesAsistencia.length === 0 ? (
                                    <View style={styles.emptyBox}><Text style={styles.emptyText}>Sin registros de asistencia recientes.</Text></View>
                                ) : (
                                    <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
                                        <View style={{ flexDirection: 'row', backgroundColor: '#333', padding: 12 }}>
                                            <Text style={{ flex: 2, color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Fecha</Text>
                                            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Total Ingresos</Text>
                                            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Clientes Únicos</Text>
                                        </View>
                                        {reportesAsistencia.map((asis, i) => (
                                            <View key={i} style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: Colors.border }}>
                                                <Text style={{ flex: 2, color: Colors.text }}>{new Date(asis.fecha).toLocaleDateString('es')}</Text>
                                                <Text style={{ flex: 1, color: Colors.primary, fontWeight: 'bold', textAlign: 'center' }}>{asis.totalAsistencias}</Text>
                                                <Text style={{ flex: 1, color: Colors.text, textAlign: 'center' }}>{asis.clientesUnicos}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Rutinas Activas */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
                                    <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '700' }}>📋 Desempeño y Rutinas Activas</Text>
                                    <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#333' }]} onPress={() => exportarCSV('rutinas')}>
                                        <Text style={styles.addBtnText}>📥 Exportar</Text>
                                    </TouchableOpacity>
                                </View>
                                {reportesRutinasList.length === 0 ? (
                                    <View style={styles.emptyBox}><Text style={styles.emptyText}>Sin rutinas activas en el sistema.</Text></View>
                                ) : (
                                    <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
                                        <View style={{ flexDirection: 'row', backgroundColor: '#333', padding: 12 }}>
                                            <Text style={{ flex: 2, color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Rutina</Text>
                                            <Text style={{ flex: 2, color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Entrenador</Text>
                                            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Alumnos</Text>
                                            <Text style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 13, textAlign: 'center' }}>Estado</Text>
                                        </View>
                                        {reportesRutinasList.map((rut, i) => (
                                            <View key={i} style={{ flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'center' }}>
                                                <Text style={{ flex: 2, color: Colors.text, fontWeight: '600' }}>{rut.nombreRutina}</Text>
                                                <Text style={{ flex: 2, color: Colors.textMuted }}>{rut.entrenador || 'N/A'}</Text>
                                                <Text style={{ flex: 1, color: Colors.text, textAlign: 'center' }}>{rut.alumnosAsignados}</Text>
                                                <View style={{ flex: 1, alignItems: 'center' }}>
                                                    <View style={[styles.badge, { backgroundColor: rut.activa ? Colors.success : '#555' }]}>
                                                        <Text style={styles.badgeText}>{rut.activa ? 'Activa' : 'Inactiva'}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}
              </View>{/* end pageInner */}
            </ScrollView>

            {/* ─── Modal Crear / Editar Usuario ─── */}
            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{editingUser ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</Text>

                        {[
                            { label: 'Nombre', key: 'nombre', placeholder: 'Ej: Carlos' },
                            { label: 'Apellido', key: 'apellido', placeholder: 'Ej: Mendoza' },
                            { label: 'Usuario', key: 'usuario', placeholder: 'Ej: carlos123' },
                            { label: 'Contraseña', key: 'contrasena', placeholder: editingUser ? 'Dejar vacío para no cambiar' : 'Contraseña', secure: true },
                            { label: 'Email', key: 'email', placeholder: 'Ej: carlos@gmail.com' },
                            { label: 'Teléfono', key: 'telefono', placeholder: 'Ej: 0991234567' },
                            { label: 'Cédula', key: 'cedula', placeholder: 'Cédula de Identidad' },
                            { label: 'Fecha Nacimiento', key: 'fechaNacimiento', placeholder: 'YYYY-MM-DD' },
                        ].map(field => (
                            <View key={field.key} style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>{field.label}</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder={field.placeholder}
                                    placeholderTextColor="#666"
                                    value={(formUsuario as any)[field.key]}
                                    onChangeText={v => setFormUsuario(prev => ({ ...prev, [field.key]: v }))}
                                    secureTextEntry={(field as any).secure}
                                    autoCapitalize="none"
                                />
                            </View>
                        ))}

                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Rol</Text>
                            <View style={styles.rolesRow}>
                                {[{ id: 1, label: '🛡️ Admin' }, { id: 2, label: '🗂️ Recep.' }, { id: 3, label: '💪 Entren.' }, { id: 4, label: '🏃 Cliente' }].map(r => (
                                    <TouchableOpacity
                                        key={r.id}
                                        style={[styles.rolBtn, formUsuario.idRol === r.id && styles.rolBtnActive]}
                                        onPress={() => setFormUsuario(prev => ({ ...prev, idRol: r.id }))}
                                    >
                                        <Text style={[styles.rolBtnText, formUsuario.idRol === r.id && { color: Colors.black }]}>{r.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {formUsuario.idRol === 4 && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Entrenador Asignado</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        style={[styles.rolBtn, formUsuario.idEntrenador === null && styles.rolBtnActive, { marginRight: 8 }]}
                                        onPress={() => setFormUsuario(prev => ({ ...prev, idEntrenador: null }))}
                                    >
                                        <Text style={[styles.rolBtnText, formUsuario.idEntrenador === null && { color: Colors.black }]}>Ninguno</Text>
                                    </TouchableOpacity>
                                    {usuarios.filter(u => u.rol === 'Entrenador' && u.activo).map(ent => (
                                        <TouchableOpacity
                                            key={ent.id}
                                            style={[styles.rolBtn, formUsuario.idEntrenador === ent.id && styles.rolBtnActive, { marginRight: 8 }]}
                                            onPress={() => setFormUsuario(prev => ({ ...prev, idEntrenador: ent.id }))}
                                        >
                                            <Text style={[styles.rolBtnText, formUsuario.idEntrenador === ent.id && { color: Colors.black }]}>{ent.nombre} {ent.apellido}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={guardarUsuario} disabled={savingUser}>
                                {savingUser
                                    ? <ActivityIndicator color={Colors.black} size="small" />
                                    : <Text style={styles.saveBtnText}>Guardar</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ─── Modal Asignar Membresía ─── */}
            <Modal visible={modalMembresia} animationType="slide" transparent onRequestClose={() => setModalMembresia(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>🎫 Membresía para {clienteMembresia?.nombre}</Text>

                        {PLANES_MEMBRESIA.map(plan => (
                            <TouchableOpacity
                                key={plan.id}
                                style={{ backgroundColor: '#212529', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                                onPress={() => asignarMembresia(plan.id)}
                                disabled={savingMembresia}
                            >
                                <View>
                                    <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '600' }}>{plan.nombre}</Text>
                                    <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 4 }}>{plan.dias} días</Text>
                                </View>
                                <Text style={{ color: Colors.success, fontSize: 18, fontWeight: 'bold' }}>${plan.precio}</Text>
                            </TouchableOpacity>
                        ))}

                        <View style={{ marginTop: 20 }}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalMembresia(false)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ─── Modal VISTA DE COMPROBANTE ─── */}
            <Modal visible={modalComprobante} animationType="fade" transparent onRequestClose={() => setModalComprobante(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                    <View style={[styles.modalCard, { maxWidth: 400, padding: 20 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={styles.modalTitle}>🧾 Comprobante de Pago</Text>
                            <TouchableOpacity onPress={() => setModalComprobante(false)}>
                                <Text style={{ color: Colors.danger, fontSize: 24, fontWeight: 'bold' }}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingComprobante ? (
                            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 30 }} />
                        ) : comprobanteData ? (
                            <ScrollView style={{ backgroundColor: '#1e1e1e', borderRadius: 8, padding: 15 }}>
                                <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>IRON ADMIN GYM</Text>
                                <Text style={{ color: '#aaa', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>Factura Electrónica</Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                    <Text style={{ color: '#aaa' }}>Factura Nº:</Text>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{comprobanteData.numeroFactura}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 15 }}>
                                    <Text style={{ color: '#aaa' }}>Fecha:</Text>
                                    <Text style={{ color: '#fff' }}>{new Date(comprobanteData.fechaEmision).toLocaleString('es')}</Text>
                                </View>

                                <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 10 }}>DETALLE:</Text>
                                
                                {comprobanteData.detalle && comprobanteData.detalle.map((item: any, idx: number) => (
                                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <View style={{ flex: 2 }}>
                                            <Text style={{ color: '#fff' }}>{item.cantidad}x {item.descripcion}</Text>
                                            <Text style={{ color: '#888', fontSize: 11 }}>PU: ${item.precioUnitario?.toFixed(2)}</Text>
                                        </View>
                                        <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                                            <Text style={{ color: '#fff' }}>${item.subtotal?.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                ))}

                                <View style={{ borderTopWidth: 1, borderTopColor: '#333', marginTop: 15, paddingTop: 15 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <Text style={{ color: '#aaa' }}>Subtotal:</Text>
                                        <Text style={{ color: '#fff' }}>${comprobanteData.subtotal?.toFixed(2)}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <Text style={{ color: '#aaa' }}>IVA:</Text>
                                        <Text style={{ color: '#fff' }}>${comprobanteData.iva?.toFixed(2)}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#444' }}>
                                        <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 18 }}>TOTAL PAGADO:</Text>
                                        <Text style={{ color: Colors.success, fontWeight: 'bold', fontSize: 18 }}>${comprobanteData.totalPagado?.toFixed(2)}</Text>
                                    </View>
                                </View>
                                <Text style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 30, marginBottom: 10 }}>
                                    Gracias por su compra
                                </Text>
                            </ScrollView>
                        ) : (
                            <Text style={{ color: '#fff', textAlign: 'center' }}>No se encontraron detalles.</Text>
                        )}
                    </View>
                </View>
            </Modal>
            {/* ─── Modal Producto (CRUD Tienda) ─── */}
            <Modal visible={modalProducto} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{editingProduct ? '✏️ Editar Producto' : '📦 Nuevo Producto'}</Text>
                        <ScrollView style={{ maxHeight: '80%' }}>
                            <Text style={styles.feLabel}>Nombre</Text>
                            <TextInput style={styles.feInput} value={formProducto.nombre} onChangeText={t => setFormProducto(prev => ({ ...prev, nombre: t }))} />
                            
                            <Text style={styles.feLabel}>Descripción</Text>
                            <TextInput style={[styles.feInput, { height: 60, textAlignVertical: 'top' }]} multiline value={formProducto.descripcion} onChangeText={t => setFormProducto(prev => ({ ...prev, descripcion: t }))} />
                            
                            <Text style={styles.feLabel}>Precio ($)</Text>
                            <TextInput style={styles.feInput} keyboardType="numeric" value={formProducto.precio} onChangeText={t => setFormProducto(prev => ({ ...prev, precio: t }))} />
                            
                            <Text style={styles.feLabel}>Tipo (Ej: Tienda, Suplemento, Ropa)</Text>
                            <TextInput style={styles.feInput} value={formProducto.tipo} onChangeText={t => setFormProducto(prev => ({ ...prev, tipo: t }))} />
                            
                            <Text style={styles.feLabel}>URL Imagen (Opcional)</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <TextInput style={[styles.feInput, { flex: 1, marginBottom: 0 }]} placeholder="https://ejemplo.com/foto.jpg" placeholderTextColor="#666" value={formProducto.imagenUrl} onChangeText={t => setFormProducto(prev => ({ ...prev, imagenUrl: t }))} />
                                <TouchableOpacity style={{ backgroundColor: Colors.primary, padding: 12, borderRadius: 8, height: 45, justifyContent: 'center' }} onPress={pickImageProducto}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>📁 Archivo</Text>
                                </TouchableOpacity>
                            </View>
                            {formProducto.imagenBase64 ? <Text style={{ color: Colors.primary, fontSize: 12, marginTop: 5, marginBottom: 15 }}>✓ Imagen local seleccionada</Text> : <View style={{ height: 15 }} />}
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalProducto(false)}>
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.saveBtn, savingProducto && { opacity: 0.6 }]} 
                                disabled={savingProducto}
                                onPress={async () => {
                                    if (!formProducto.nombre || !formProducto.precio || !formProducto.tipo) {
                                        Alert.alert('Error', 'Nombre, precio y tipo son obligatorios');
                                        return;
                                    }
                                    setSavingProducto(true);
                                    try {
                                        const payload = {
                                            nombre: formProducto.nombre,
                                            descripcion: formProducto.descripcion,
                                            precio: parseFloat(formProducto.precio) || 0,
                                            tipo: formProducto.tipo,
                                            imagenUrl: formProducto.imagenUrl,
                                            imagenBase64: formProducto.imagenBase64
                                        };
                                        if (editingProduct) {
                                            await productosService.update(editingProduct.idProducto || editingProduct.id!, payload);
                                            Alert.alert('✅ Éxito', 'Producto actualizado');
                                        } else {
                                            await productosService.create(payload);
                                            Alert.alert('✅ Éxito', 'Producto creado');
                                        }
                                        setModalProducto(false);
                                        cargarProductos();
                                    } catch (e: any) {
                                        Alert.alert('Error', e.message || 'Error al guardar el producto');
                                    } finally {
                                        setSavingProducto(false);
                                    }
                                }}
                            >
                                <Text style={styles.saveText}>{savingProducto ? 'Guardando...' : '💾 Guardar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { color: Colors.primary, fontWeight: 'bold', fontSize: 18 },
    headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    logoutBtn: { borderWidth: 1, borderColor: Colors.danger, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
    logoutText: { color: Colors.danger, fontSize: 13 },
    tabsBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 60 },
    tab: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: Colors.primary },
    tabIcon: { fontSize: 16 },
    tabLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    tabLabelActive: { color: Colors.primary, fontWeight: '600' },
    content: { flex: 1 },
    pageInner: { width: '100%', maxWidth: 1100, paddingHorizontal: 16, paddingTop: 14 },
    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
    loadingText: { color: Colors.textMuted, fontSize: 13 },
    warnBox: { backgroundColor: '#2d1a00', borderLeftWidth: 3, borderLeftColor: Colors.warning, borderRadius: 8, padding: 12, marginBottom: 14 },
    warnText: { color: Colors.warning, fontSize: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 10 },
    statCard: { backgroundColor: '#212529', borderLeftWidth: 4, borderRadius: 10, padding: 14, width: '47%' },
    statIcon: { fontSize: 22, marginBottom: 4 },
    statValue: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
    statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12, marginTop: 4 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    addBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
    addBtnText: { color: Colors.black, fontWeight: '700', fontSize: 13 },
    card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 10 },
    cardRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: Colors.black, fontWeight: 'bold', fontSize: 16 },
    cardName: { color: Colors.text, fontWeight: '600', fontSize: 15 },
    cardSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    estadoBadge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
    cardFooterText: { color: Colors.textMuted, fontSize: 12 },
    logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
    logAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    logAvatarText: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 },
    logUser: { color: Colors.text, fontWeight: '600', fontSize: 14 },
    logRol: { color: Colors.textMuted, fontSize: 12 },
    logDetail: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    logTime: { color: Colors.textMuted, fontSize: 12 },
    emptyBox: { alignItems: 'center', paddingVertical: 30 },
    emptyText: { color: Colors.textMuted, fontSize: 14 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 620 },
    modalTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 18, marginBottom: 20, textAlign: 'center' },
    fieldGroup: { marginBottom: 14 },
    fieldLabel: { color: Colors.textMuted, fontSize: 13, marginBottom: 6 },
    fieldInput: { backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 12, color: Colors.text, fontSize: 14 },
    rolesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    rolBtn: { flex: 1, minWidth: '22%', backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 10, alignItems: 'center' },
    rolBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    rolBtnText: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#555', borderRadius: 10, padding: 14, alignItems: 'center' },
    cancelText: { color: Colors.textMuted, fontWeight: '600' },
    saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
    saveText: { color: '#000', fontWeight: 'bold' },
    
    // Tienda Styles
    feLabel: { color: Colors.textMuted, fontSize: 13, marginBottom: 5 },
    feInput: { backgroundColor: '#1e1e1e', color: Colors.text, padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: Colors.border },
    saveBtnText: { color: Colors.black, fontWeight: '700', fontSize: 15 },
});