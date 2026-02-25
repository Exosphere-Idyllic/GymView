// src/components/dashboards/DashboardEntrenador.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
    Alert, Modal, ActivityIndicator, TextInput,
} from 'react-native';
import Colors from '../../theme/colors';
import { useAuth } from '../../store/AuthContext';
import { useRouter } from 'expo-router';
import entrenadoresService, { EntrenadorDashboard, NuevaRutina, RutinaItem } from '../../services/entrenadores.service';

type Tab = 'tablero' | 'alumnos' | 'rutinas';

// Lista de ejercicios disponibles (igual que el backend tiene en su BD)
const EJERCICIOS_DISPONIBLES = [
    { id: 1, nombre: 'Press de Banca Plano', musculo: 'Pecho' },
    { id: 2, nombre: 'Sentadilla con Barra', musculo: 'Piernas' },
    { id: 3, nombre: 'Jalón al Pecho', musculo: 'Espalda' },
    { id: 4, nombre: 'Curl con Mancuernas', musculo: 'Bíceps' },
    { id: 5, nombre: 'Press Militar', musculo: 'Hombros' },
    { id: 6, nombre: 'Peso Muerto', musculo: 'Espalda/Piernas' },
    { id: 7, nombre: 'Fondos en Paralelas', musculo: 'Tríceps' },
    { id: 8, nombre: 'Plancha Abdominal', musculo: 'Core' },
];

export default function DashboardEntrenador() {
    const [activeTab, setActiveTab] = useState<Tab>('tablero');
    const [dashboard, setDashboard] = useState<EntrenadorDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const { user, logout } = useAuth();
    const router = useRouter();

    // ── Modal crear/editar rutina ──────────────────────────────
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRutina, setEditingRutina] = useState<RutinaItem | null>(null);
    const [formRutina, setFormRutina] = useState<NuevaRutina>({ idCliente: 0, nombreRutina: '', idsEjercicios: [] });
    const [savingRutina, setSavingRutina] = useState(false);

    const cargarDashboard = useCallback(async () => {
        if (!user?.id_usuario) return;
        setLoading(true);
        setApiError(null);
        try {
            const data = await entrenadoresService.getDashboard(user.id_usuario);
            setDashboard(data);
        } catch (e: any) {
            setApiError(e.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id_usuario]);

    useEffect(() => {
        cargarDashboard();
    }, [cargarDashboard]);

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'tablero', label: 'Tablero', icon: '📊' },
        { key: 'alumnos', label: 'Alumnos', icon: '👥' },
        { key: 'rutinas', label: 'Rutinas', icon: '📋' },
    ];

    // ── Crear rutina ───────────────────────────────────────────
    const abrirCrearRutina = (idCliente?: number) => {
        setEditingRutina(null);
        setFormRutina({ idCliente: idCliente || 0, nombreRutina: '', idsEjercicios: [] });
        setModalVisible(true);
    };

    const abrirEditarRutina = (r: RutinaItem) => {
        setEditingRutina(r);
        setFormRutina({ idCliente: r.idCliente, nombreRutina: r.nombre, idsEjercicios: [...r.idsEjercicios] });
        setModalVisible(true);
    };

    const guardarRutina = async () => {
        if (!formRutina.nombreRutina.trim()) {
            Alert.alert('Error', 'El nombre de la rutina es obligatorio');
            return;
        }
        if (formRutina.idCliente === 0) {
            Alert.alert('Error', 'Selecciona un cliente');
            return;
        }
        if (formRutina.idsEjercicios.length === 0) {
            Alert.alert('Error', 'Selecciona al menos un ejercicio');
            return;
        }
        setSavingRutina(true);
        try {
            if (editingRutina) {
                await entrenadoresService.editarRutina(editingRutina.id, formRutina);
                Alert.alert('✅', 'Rutina actualizada');
            } else {
                await entrenadoresService.crearRutina(user!.id_usuario, formRutina);
                Alert.alert('✅', 'Rutina creada correctamente');
            }
            setModalVisible(false);
            cargarDashboard();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setSavingRutina(false);
        }
    };

    const eliminarRutina = (r: RutinaItem) => {
        Alert.alert('Eliminar Rutina', `¿Desactivar "${r.nombre}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Desactivar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await entrenadoresService.eliminarRutina(r.id);
                        cargarDashboard();
                    } catch (e: any) {
                        Alert.alert('Error', e.message);
                    }
                }
            }
        ]);
    };

    const toggleEjercicio = (id: number) => {
        setFormRutina(prev => ({
            ...prev,
            idsEjercicios: prev.idsEjercicios.includes(id)
                ? prev.idsEjercicios.filter(e => e !== id)
                : [...prev.idsEjercicios, id],
        }));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} size="large" />
                    <Text style={styles.loadingText}>Cargando tablero...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!dashboard) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <Text style={{ fontSize: 48 }}>⚠️</Text>
                    <Text style={styles.loadingText}>{apiError || 'Error al cargar'}</Text>
                    <TouchableOpacity onPress={cargarDashboard} style={styles.retryBtn}>
                        <Text style={{ color: Colors.black, fontWeight: '700' }}>🔄 Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>⚡ IRON COACH</Text>
                    <Text style={styles.headerSub}>
                        {dashboard.nombre} · {dashboard.especialidad}
                        {apiError ? '  ⚠️' : '  🟢'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(auth)/login'); }}>
                    <Text style={styles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsBar} contentContainerStyle={{ paddingHorizontal: 10 }}>
                {tabs.map(t => (
                    <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.tabActive]} onPress={() => setActiveTab(t.key)}>
                        <Text>{t.icon}</Text>
                        <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>

                {/* TABLERO */}
                {activeTab === 'tablero' && (
                    <>
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { borderLeftColor: '#1565C0' }]}>
                                <Text style={styles.statIcon}>👥</Text>
                                <Text style={[styles.statVal, { color: '#42A5F5' }]}>{dashboard.totalAlumnos}</Text>
                                <Text style={styles.statLabel}>Alumnos</Text>
                            </View>
                            <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
                                <Text style={styles.statIcon}>📋</Text>
                                <Text style={[styles.statVal, { color: Colors.primary }]}>{dashboard.rutinasCreadas}</Text>
                                <Text style={styles.statLabel}>Rutinas Activas</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Estado de Alumnos</Text>
                        {dashboard.listaAlumnos.length === 0 ? (
                            <Text style={styles.empty}>No tienes alumnos asignados</Text>
                        ) : (
                            dashboard.listaAlumnos.map((al, i) => (
                                <View key={i} style={styles.alumnoRow}>
                                    <View style={[styles.avatar, { backgroundColor: '#1565C0' }]}>
                                        <Text style={styles.avatarText}>{al.nombre.charAt(0)}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={styles.alumnoName}>{al.nombre}</Text>
                                        <Text style={styles.alumnoSub}>{al.rutina}</Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: al.terminoHoy ? Colors.success : '#555' }]}>
                                        <Text style={styles.badgeText}>{al.terminoHoy ? '✅ Listo' : '⏳ Pend.'}</Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}

                {/* ALUMNOS */}
                {activeTab === 'alumnos' && (
                    <>
                        <Text style={styles.sectionTitle}>Mis Alumnos ({dashboard.listaAlumnos.length})</Text>
                        {dashboard.listaAlumnos.length === 0 ? (
                            <View style={[styles.card, { alignItems: 'center', padding: 30 }]}>
                                <Text style={{ fontSize: 48 }}>👥</Text>
                                <Text style={styles.empty}>Sin alumnos asignados aún</Text>
                            </View>
                        ) : (
                            dashboard.listaAlumnos.map((al, i) => (
                                <View key={i} style={styles.card}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={[styles.avatar, { backgroundColor: '#1565C0' }]}>
                                            <Text style={styles.avatarText}>{al.nombre.charAt(0)}</Text>
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={styles.alumnoName}>{al.nombre}</Text>
                                            <Text style={styles.alumnoSub}>{al.plan}</Text>
                                        </View>
                                        <View style={[styles.badge, { backgroundColor: al.terminoHoy ? Colors.success : '#555' }]}>
                                            <Text style={styles.badgeText}>{al.terminoHoy ? '✅' : '⏳'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.alumnoSub}>🏋️ {al.rutina}</Text>
                                        <TouchableOpacity onPress={() => abrirCrearRutina(al.idCliente)}>
                                            <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>+ Rutina</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}

                {/* RUTINAS */}
                {activeTab === 'rutinas' && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Biblioteca ({dashboard.listaRutinas.length})</Text>
                            <TouchableOpacity style={styles.addBtn} onPress={() => abrirCrearRutina()}>
                                <Text style={styles.addBtnText}>+ Nueva</Text>
                            </TouchableOpacity>
                        </View>
                        {dashboard.listaRutinas.length === 0 ? (
                            <View style={[styles.card, { alignItems: 'center', padding: 30 }]}>
                                <Text style={{ fontSize: 48 }}>📋</Text>
                                <Text style={styles.empty}>No hay rutinas creadas</Text>
                            </View>
                        ) : (
                            dashboard.listaRutinas.map((r, i) => (
                                <View key={i} style={[styles.card, !r.activa && { opacity: 0.5 }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.alumnoName}>{r.nombre}</Text>
                                            <Text style={styles.alumnoSub}>{r.idsEjercicios.length} ejercicios · Cliente ID: {r.idCliente}</Text>
                                        </View>
                                        <View style={[styles.badge, { backgroundColor: r.activa ? Colors.success : '#555' }]}>
                                            <Text style={styles.badgeText}>{r.activa ? 'Activa' : 'Inactiva'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity onPress={() => abrirEditarRutina(r)}>
                                            <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>✏️ Editar</Text>
                                        </TouchableOpacity>
                                        {r.activa ? (
                                            <TouchableOpacity onPress={() => eliminarRutina(r)}>
                                                <Text style={{ color: Colors.danger, fontSize: 13, fontWeight: '600' }}>🗑️ Desactivar</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity onPress={async () => {
                                                try {
                                                    await entrenadoresService.reactivarRutina(r.id);
                                                    cargarDashboard();
                                                } catch (e: any) { Alert.alert('Error', e.message); }
                                            }}>
                                                <Text style={{ color: Colors.success, fontSize: 13, fontWeight: '600' }}>✅ Reactivar</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}
            </ScrollView>

            {/* ─── Modal Crear/Editar Rutina ─── */}
            <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <ScrollView>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>{editingRutina ? '✏️ Editar Rutina' : '➕ Nueva Rutina'}</Text>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Nombre de la rutina *</Text>
                                <TextInput
                                    style={styles.fieldInput}
                                    placeholder="Ej: Tren Superior Fuerza"
                                    placeholderTextColor="#666"
                                    value={formRutina.nombreRutina}
                                    onChangeText={v => setFormRutina(prev => ({ ...prev, nombreRutina: v }))}
                                />
                            </View>

                            {dashboard.listaAlumnos.length > 0 && (
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>Cliente asignado *</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            {dashboard.listaAlumnos.map((al, i) => (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={[styles.rolBtn, formRutina.idCliente === al.idCliente && styles.rolBtnActive]}
                                                    onPress={() => setFormRutina(prev => ({ ...prev, idCliente: al.idCliente }))}
                                                >
                                                    <Text style={[styles.rolBtnText, formRutina.idCliente === al.idCliente && { color: Colors.black }]}>
                                                        {al.nombre.split(' ')[0]}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            )}

                            <View style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Ejercicios ({formRutina.idsEjercicios.length} seleccionados)</Text>
                                {EJERCICIOS_DISPONIBLES.map(e => {
                                    const sel = formRutina.idsEjercicios.includes(e.id);
                                    return (
                                        <TouchableOpacity
                                            key={e.id}
                                            style={[styles.ejercicioItem, sel && styles.ejercicioItemSel]}
                                            onPress={() => toggleEjercicio(e.id)}
                                        >
                                            <Text style={[styles.ejercicioItemText, sel && { color: Colors.black }]}>
                                                {sel ? '✓ ' : '○ '}{e.nombre}
                                            </Text>
                                            <Text style={[styles.ejercicioItemSub, sel && { color: Colors.black }]}>{e.musculo}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={guardarRutina} disabled={savingRutina}>
                                    {savingRutina
                                        ? <ActivityIndicator color={Colors.black} size="small" />
                                        : <Text style={styles.saveBtnText}>Guardar</Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 20 },
    loadingText: { color: Colors.textMuted, fontSize: 14 },
    retryBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { color: Colors.primary, fontWeight: 'bold', fontSize: 18 },
    headerSub: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
    logoutBtn: { borderWidth: 1, borderColor: Colors.danger, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
    logoutText: { color: Colors.danger, fontSize: 13 },
    tabsBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 60 },
    tab: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: Colors.primary },
    tabLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    tabLabelActive: { color: Colors.primary, fontWeight: '600' },
    content: { flex: 1, padding: 14 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: Colors.surface, borderLeftWidth: 4, borderRadius: 10, padding: 14 },
    statIcon: { fontSize: 22, marginBottom: 4 },
    statVal: { fontSize: 26, fontWeight: 'bold' },
    statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    addBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
    addBtnText: { color: Colors.black, fontWeight: '700', fontSize: 13 },
    card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 10 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
    alumnoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: Colors.black, fontWeight: 'bold', fontSize: 16 },
    alumnoName: { color: Colors.text, fontWeight: '600', fontSize: 14 },
    alumnoSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
    empty: { color: Colors.textMuted, textAlign: 'center', fontSize: 14, paddingVertical: 10 },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
    modalTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 18, marginBottom: 20, textAlign: 'center' },
    fieldGroup: { marginBottom: 16 },
    fieldLabel: { color: Colors.textMuted, fontSize: 13, marginBottom: 8 },
    fieldInput: { backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 12, color: Colors.text, fontSize: 14 },
    rolesRow: { flexDirection: 'row', gap: 8 },
    rolBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 8 },
    rolBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    rolBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
    ejercicioItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 10, marginBottom: 6 },
    ejercicioItemSel: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    ejercicioItemText: { color: Colors.text, fontSize: 13, fontWeight: '600' },
    ejercicioItemSub: { color: Colors.textMuted, fontSize: 11 },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#555', borderRadius: 10, padding: 14, alignItems: 'center' },
    cancelText: { color: Colors.textMuted, fontWeight: '600' },
    saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
    saveBtnText: { color: Colors.black, fontWeight: '700', fontSize: 15 },
});