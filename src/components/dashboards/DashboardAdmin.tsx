// src/components/dashboards/DashboardAdmin.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import Colors from '../../theme/colors';
import { useAuth } from '../../store/AuthContext';
import { useRouter } from 'expo-router';
import authService, { AdminDashboardResponse, AdminUsuario } from '../../services/auth.service';
import pagosService, { Pago } from '../../services/pagos.service';
import membresiaService, { PLANES_MEMBRESIA } from '../../services/membresia.service';
import apiClient from '../../services/api.client';
import { API_CONFIG } from '../../config/api.config';

type Tab = 'resumen' | 'clientes' | 'entrenadores' | 'pagos' | 'logs' | 'usuarios';

export default function DashboardAdmin() {
    const [activeTab, setActiveTab] = useState<Tab>('resumen');
    const { user, logout } = useAuth();
    const router = useRouter();

    // ── Estado API ─────────────────────────────────────────────
    const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
    const [usuarios, setUsuarios] = useState<AdminUsuario[]>([]);
    const [clientes, setClientes] = useState<AdminUsuario[]>([]);
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [loadingPagos, setLoadingPagos] = useState(false);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // ── Estado Modal Crear/Editar usuario ──────────────────────
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUsuario | null>(null);
    const [formUsuario, setFormUsuario] = useState({
        nombre: '', apellido: '', usuario: '', contrasena: '', idRol: 4,
        email: '', telefono: '', cedula: '', fechaNacimiento: ''
    });
    const [savingUser, setSavingUser] = useState(false);

    // ── Estado Modal Membresía ──────────────────────────────────
    const [modalMembresia, setModalMembresia] = useState(false);
    const [clienteMembresia, setClienteMembresia] = useState<AdminUsuario | null>(null);
    const [savingMembresia, setSavingMembresia] = useState(false);

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'resumen', label: 'Resumen', icon: '📊' },
        { key: 'usuarios', label: 'Usuarios', icon: '🛡️' },
        { key: 'clientes', label: 'Clientes', icon: '👥' },
        { key: 'pagos', label: 'Pagos', icon: '💰' },
        { key: 'logs', label: 'Accesos', icon: '🔐' },
    ];

    // ── Cargar stats ───────────────────────────────────────────
    const cargarStats = useCallback(async () => {
        setLoadingStats(true);
        setApiError(null);
        try {
            const data = await authService.getAdminDashboard();
            setStats(data);
        } catch (e: any) {
            setApiError(e.message);
            // Fallback a mock
            setStats({ totalClientes: 4, totalEntrenadores: 2, ingresos: 119.96 });
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

    const cargarPagos = useCallback(async () => {
        setLoadingPagos(true);
        try {
            const data = await pagosService.getAll();
            setPagos(data);
        } catch (e: any) {
            // Si el endpoint aún no existe en el backend, mostramos lista vacía
            setPagos([]);
        } finally {
            setLoadingPagos(false);
        }
    }, []);

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

    useEffect(() => {
        cargarStats();
        cargarLogs();
    }, []);

    useEffect(() => {
        if (activeTab === 'usuarios') cargarUsuarios();
        if (activeTab === 'clientes') cargarClientes();
        if (activeTab === 'pagos') cargarPagos();
        if (activeTab === 'logs') cargarLogs();
    }, [activeTab]);

    // ── Acciones usuario ───────────────────────────────────────
    const abrirModalCrear = () => {
        setEditingUser(null);
        setFormUsuario({
            nombre: '', apellido: '', usuario: '', contrasena: '', idRol: 4,
            email: '', telefono: '', cedula: '', fechaNacimiento: ''
        });
        setModalVisible(true);
    };

    const abrirModalEditar = (u: AdminUsuario) => {
        setEditingUser(u);
        setFormUsuario({
            nombre: u.nombre, apellido: u.apellido, usuario: u.usuario, contrasena: '', idRol: rolNameToId(u.rol),
            email: u.email || '', telefono: u.telefono || '', cedula: u.cedula || '', fechaNacimiento: u.fechaNacimiento?.split('T')[0] || ''
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

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>

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
                                            <Text style={[styles.statValue, { color: Colors.success, fontSize: 20 }]}>${p.monto}</Text>
                                        </View>
                                        {p.observaciones ? <Text style={styles.logDetail}>📝 {p.observaciones}</Text> : null}
                                    </View>
                                ))}
                            </>
                        )}
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
    content: { flex: 1, padding: 14 },
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
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
    saveBtnText: { color: Colors.black, fontWeight: '700', fontSize: 15 },
});