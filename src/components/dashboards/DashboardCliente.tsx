// src/components/dashboards/DashboardCliente.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Image } from 'react-native';
import Colors from '../../theme/colors';
import { useAuth } from '../../store/AuthContext';
import { useRouter } from 'expo-router';
import clientesService, { ClienteDashboard } from '../../services/clientes.service';

type Tab = 'inicio' | 'rutina' | 'membresia';

export default function DashboardCliente() {
    const [activeTab, setActiveTab] = useState<Tab>('inicio');
    const [ejerciciosCompletados, setEjerciciosCompletados] = useState<number[]>([]);
    const [dashboard, setDashboard] = useState<ClienteDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [completandoRutina, setCompletandoRutina] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const { user, logout } = useAuth();
    const router = useRouter();

    const cargarDashboard = useCallback(async () => {
        if (!user?.id_usuario) return;
        setLoading(true);
        setApiError(null);
        try {
            const data = await clientesService.getDashboard(user.id_usuario);
            setDashboard(data);
        } catch (e: any) {
            setApiError(e.message);
            // Fallback mock
            setDashboard({
                nombreCompleto: user.nombre_completo || 'Juan Pérez',
                email: user.email || 'juan@email.com',
                telefono: '0991234567',
                historialAsistencias: [
                    { fecha: '2026-02-18', hora: '08:30' },
                    { fecha: '2026-02-17', hora: '07:45' },
                ],
                nombreRutina: 'Rutina de Fuerza - Tren Superior',
                entrenador: 'Carlos Mendoza',
                ejercicios: [
                    { nombre: 'Press de Banca Plano', seriesReps: '4 x 12' },
                    { nombre: 'Jalón al Pecho', seriesReps: '4 x 12' },
                    { nombre: 'Press Militar', seriesReps: '3 x 10' },
                ],
                rutinaTerminadaHoy: false,
                nombrePlan: 'Plan Black',
                precioPlan: 34.99,
                fechaVencimiento: '2026-03-18',
                estadoMembresia: 'Activo',
            });
        } finally {
            setLoading(false);
        }
    }, [user?.id_usuario]);

    useEffect(() => {
        cargarDashboard();
    }, [cargarDashboard]);

    const handleCompletarRutina = async () => {
        if (!user?.id_usuario) return;
        setCompletandoRutina(true);
        try {
            const res = await clientesService.completarRutina(user.id_usuario);
            Alert.alert('🏆 ¡Excelente!', res.mensaje || '¡Entrenamiento completado!');
            cargarDashboard();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setCompletandoRutina(false);
        }
    };

    const toggleEjercicio = (idx: number) => {
        setEjerciciosCompletados(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        );
    };

    const tabs: { key: Tab; label: string; icon: string }[] = [
        { key: 'inicio', label: 'Inicio', icon: '🏠' },
        { key: 'rutina', label: 'Entrenamiento', icon: '🏋️' },
        { key: 'membresia', label: 'Membresía', icon: '💳' },
    ];

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.centered}>
                    <ActivityIndicator color={Colors.primary} size="large" />
                    <Text style={styles.loadingText}>Cargando tu perfil...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const d = dashboard!;
    const membresiaActiva = d.estadoMembresia === 'Activo' || d.estadoMembresia === 'Activa';

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>⚡ IRON MEMBER</Text>
                    <Text style={styles.headerSub}>
                        Hola, {d.nombreCompleto}
                        {apiError ? '  ⚠️ offline' : '  🟢'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(auth)/login'); }}>
                    <Text style={styles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsBar} contentContainerStyle={{ paddingHorizontal: 10 }}>
                {tabs.map(t => (
                    <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.tabActive]} onPress={() => setActiveTab(t.key)}>
                        <Text>{t.icon}</Text>
                        <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.tab} onPress={() => router.push('/catalogo')}>
                    <Text>🛒</Text>
                    <Text style={styles.tabLabel}>Tienda Online</Text>
                </TouchableOpacity>
            </ScrollView>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>

                {/* ─── INICIO ─── */}
                {activeTab === 'inicio' && (
                    <>
                        {/* Pase QR – imagen por URL (API pública QR) */}
                        <View style={styles.qrCard}>
                            <Text style={styles.qrTitle}>🎫 Pase de Acceso</Text>
                            <View style={styles.qrBox}>
                                <Image
                                    source={{
                                        uri: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent('IRON_' + (user?.id_usuario ?? 0))}`,
                                    }}
                                    style={styles.qrImage}
                                    resizeMode="contain"
                                />
                                <Text style={{ color: '#333', fontSize: 11, marginTop: 4 }}>ID: {user?.id_usuario}</Text>
                            </View>
                            <Text style={styles.qrId}>
                                ID Usuario: <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{user?.id_usuario}</Text>
                            </Text>
                        </View>

                        {/* Datos */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Mis Datos</Text>
                            {[
                                { label: 'Nombre', val: d.nombreCompleto },
                                { label: 'Email', val: d.email || 'No disponible' },
                                { label: 'Teléfono', val: d.telefono || 'No disponible' },
                            ].map((row, i) => (
                                <View key={i} style={styles.dataRow}>
                                    <Text style={styles.dataLabel}>{row.label}</Text>
                                    <Text style={styles.dataVal}>{row.val}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Historial */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Últimas Asistencias</Text>
                            {d.historialAsistencias.length === 0 ? (
                                <Text style={styles.empty}>Sin registros aún</Text>
                            ) : (
                                d.historialAsistencias.map((a, i) => (
                                    <View key={i} style={styles.asistenciaRow}>
                                        <Text style={{ fontSize: 20 }}>✅</Text>
                                        <View style={{ marginLeft: 10, flex: 1 }}>
                                            <Text style={styles.asistenciaDate}>{a.fecha}</Text>
                                            <Text style={styles.asistenciaTime}>Entrada: {a.hora}</Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </>
                )}

                {/* ─── RUTINA ─── */}
                {activeTab === 'rutina' && (
                    <>
                        {!d.nombreRutina ? (
                            <View style={[styles.card, { alignItems: 'center', padding: 30 }]}>
                                <Text style={{ fontSize: 48, marginBottom: 10 }}>🏋️</Text>
                                <Text style={styles.empty}>No tienes rutina asignada hoy.</Text>
                                <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center' }}>
                                    Tu entrenador te asignará una rutina.
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: Colors.primary }]}>
                                    <Text style={styles.sectionTitle}>{d.nombreRutina}</Text>
                                    <Text style={styles.dataLabel}>👤 Entrenador: {d.entrenador}</Text>
                                    <Text style={[styles.dataLabel, { marginTop: 4 }]}>
                                        Progreso: {ejerciciosCompletados.length}/{d.ejercicios.length}
                                    </Text>
                                    <View style={styles.progressBar}>
                                        <View style={[
                                            styles.progressFill,
                                            { width: `${d.ejercicios.length > 0 ? (ejerciciosCompletados.length / d.ejercicios.length) * 100 : 0}%` as any }
                                        ]} />
                                    </View>
                                </View>

                                {d.ejercicios.map((e, i) => {
                                    const done = ejerciciosCompletados.includes(i);
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={[styles.ejercicioCard, done && styles.ejercicioDone]}
                                            onPress={() => toggleEjercicio(i)}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.ejercicioName, done && styles.ejercicioDoneText]}>{e.nombre}</Text>
                                                <Text style={styles.ejercicioStat}>{e.seriesReps}</Text>
                                            </View>
                                            <View style={[styles.checkbox, done && styles.checkboxDone]}>
                                                {done && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}

                                {d.rutinaTerminadaHoy ? (
                                    <View style={[styles.finBtn, { backgroundColor: Colors.success }]}>
                                        <Text style={styles.finBtnText}>✅ Entrenamiento Completado Hoy</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={[
                                            styles.finBtn,
                                            ejerciciosCompletados.length === d.ejercicios.length && styles.finBtnReady,
                                        ]}
                                        onPress={() => {
                                            if (ejerciciosCompletados.length === d.ejercicios.length) {
                                                handleCompletarRutina();
                                            } else {
                                                Alert.alert('⏳', `Faltan ${d.ejercicios.length - ejerciciosCompletados.length} ejercicios por completar`);
                                            }
                                        }}
                                        disabled={completandoRutina}
                                    >
                                        {completandoRutina ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.finBtnText}>
                                                {ejerciciosCompletados.length === d.ejercicios.length
                                                    ? '🏆 TERMINAR ENTRENAMIENTO'
                                                    : `⏳ ${d.ejercicios.length - ejerciciosCompletados.length} ejercicios pendientes`}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* ─── MEMBRESÍA ─── */}
                {activeTab === 'membresia' && (
                    <View style={{ alignItems: 'center' }}>
                        <View style={styles.membresiaCard}>
                            <Text style={{ fontSize: 64, marginBottom: 16 }}>{membresiaActiva ? '🛡️' : '❌'}</Text>
                            <Text style={styles.membresiaTitle}>{d.nombrePlan || 'Sin plan'}</Text>
                            <View style={[styles.badge, {
                                backgroundColor: membresiaActiva ? Colors.success : Colors.danger,
                                alignSelf: 'center', marginVertical: 10, paddingVertical: 6, paddingHorizontal: 16
                            }]}>
                                <Text style={[styles.badgeText, { fontSize: 14 }]}>{membresiaActiva ? 'ACTIVA' : 'VENCIDA'}</Text>
                            </View>
                            <View style={styles.membresiaInfo}>
                                <View style={styles.membresiaInfoItem}>
                                    <Text style={styles.dataLabel}>Vencimiento</Text>
                                    <Text style={styles.membresiaVal}>{d.fechaVencimiento || 'N/D'}</Text>
                                </View>
                                <View style={styles.membresiaInfoItem}>
                                    <Text style={styles.dataLabel}>Precio</Text>
                                    <Text style={[styles.membresiaVal, { color: Colors.primary }]}>
                                        ${d.precioPlan?.toFixed(2) || '0.00'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.renovarBtn}
                                onPress={() => Alert.alert('Renovar Plan', 'Dirígete a recepción para renovar tu membresía.')}
                            >
                                <Text style={styles.renovarText}>💳 Renovar Plan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { color: Colors.textMuted, fontSize: 14 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { color: Colors.primary, fontWeight: 'bold', fontSize: 18 },
    headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    logoutBtn: { borderWidth: 1, borderColor: Colors.danger, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
    logoutText: { color: Colors.danger, fontSize: 13 },
    tabsBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 60 },
    tab: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: Colors.primary },
    tabLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
    tabLabelActive: { color: Colors.primary, fontWeight: '600' },
    content: { flex: 1, padding: 14 },
    qrCard: { backgroundColor: Colors.surface, borderTopWidth: 4, borderTopColor: Colors.primary, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 14 },
    qrTitle: { color: Colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 },
    qrBox: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'center' },
    qrImage: { width: 160, height: 160 },
    qrId: { color: Colors.textMuted, fontSize: 13 },
    card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
    dataLabel: { color: Colors.textMuted, fontSize: 13 },
    dataVal: { color: Colors.text, fontSize: 13, fontWeight: '600' },
    asistenciaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
    asistenciaDate: { color: Colors.text, fontWeight: '600', fontSize: 13 },
    asistenciaTime: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    empty: { color: Colors.textMuted, textAlign: 'center', fontSize: 14, paddingVertical: 10 },
    progressBar: { height: 8, backgroundColor: '#333', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
    progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
    ejercicioCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
    ejercicioDone: { borderColor: Colors.success, backgroundColor: 'rgba(25,135,84,0.12)' },
    ejercicioName: { color: Colors.text, fontWeight: '600', fontSize: 14, marginBottom: 4 },
    ejercicioDoneText: { textDecorationLine: 'line-through', color: Colors.success },
    ejercicioStat: { color: Colors.textMuted, fontSize: 12 },
    checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#444', justifyContent: 'center', alignItems: 'center' },
    checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
    finBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#444', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
    finBtnReady: { backgroundColor: Colors.success, borderColor: Colors.success },
    finBtnText: { color: Colors.text, fontWeight: '700', fontSize: 15 },
    membresiaCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 24, alignItems: 'center', width: '100%' },
    membresiaTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
    membresiaInfo: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
    membresiaInfoItem: { flex: 1, backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12 },
    membresiaVal: { color: Colors.text, fontWeight: 'bold', fontSize: 16, marginTop: 4 },
    renovarBtn: { marginTop: 20, borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30, width: '100%', alignItems: 'center' },
    renovarText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
    badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});