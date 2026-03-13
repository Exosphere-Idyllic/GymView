// app/entrenadores/[id].tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import entrenadoresService, { EntrenadorDashboard, AlumnoResumen, RutinaItem } from '../../src/services/entrenadores.service';
import apiClient from '../../src/services/api.client';
import { API_CONFIG } from '../../src/config/api.config';

export default function EntrenadorDetalle() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    
    const [dashboard, setDashboard] = useState<EntrenadorDashboard | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const cargarEntrenador = useCallback(async () => {
        try {
            setLoading(true);
            const [dashData, userData] = await Promise.all([
                entrenadoresService.getDashboard(parseInt(id)).catch(() => null),
                apiClient.get(API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(parseInt(id))).catch(() => null)
            ]);
            setDashboard(dashData);
            setUserInfo(userData);
        } catch (error) {
            console.error('Error cargando entrenador:', error);
            Alert.alert('Error', 'No se pudo recuperar la información del entrenador.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        cargarEntrenador();
    }, [cargarEntrenador]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={{ color: Colors.text, marginTop: 10 }}>Cargando perfil del entrenador...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!dashboard && !userInfo) return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.back}>← Volver</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Entrenador no encontrado en la base de datos.</Text>
            </View>
        </SafeAreaView>
    );

    const misAlumnos = dashboard?.listaAlumnos || [];
    const misRutinas = dashboard?.listaRutinas || [];

    // ... logic above replaces these lines ...

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.back}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Perfil Entrenador</Text>
                <TouchableOpacity onPress={() => Alert.alert('Editar', 'Conectado al API')}>
                    <Text style={{ color: Colors.primary }}>Editar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 14 }} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Perfil */}
                <View style={styles.profileCard}>
                    <View style={[styles.avatar, { backgroundColor: '#1565C0' }]}>
                        <Text style={styles.avatarText}>{userInfo?.nombre ? userInfo.nombre[0] : (dashboard?.nombre ? dashboard.nombre[0] : 'E')}</Text>
                    </View>
                    <Text style={styles.nombre}>{userInfo?.nombre || dashboard?.nombre} {userInfo?.apellido || ''}</Text>
                    <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
                        <Text style={styles.badgeText}>🏋️ {dashboard?.especialidad || 'Fitness'}</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Información Personal</Text>
                    {[
                        { l: 'Email', v: userInfo?.email || 'No registrado' },
                        { l: 'Especialidad', v: dashboard?.especialidad || 'General' },
                        { l: 'Total Alumnos', v: dashboard?.totalAlumnos || 0 },
                        { l: 'Rutinas Creadas', v: dashboard?.rutinasCreadas || 0 },
                    ].map((d, i) => (
                        <View key={i} style={styles.row}>
                            <Text style={styles.rowLabel}>{d.l}</Text>
                            <Text style={styles.rowVal}>{d.v}</Text>
                        </View>
                    ))}
                </View>

                {/* Notas de desempeño */}
                {userInfo?.notas_desempeno && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Notas de Desempeño</Text>
                        <Text style={styles.notasText}>{userInfo.notas_desempeno}</Text>
                    </View>
                )}

                {/* Alumnos */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Alumnos Asignados ({misAlumnos.length})</Text>
                    {misAlumnos.length === 0 ? (
                        <Text style={styles.empty}>Sin alumnos asignados</Text>
                    ) : (
                        misAlumnos.map((al: AlumnoResumen) => (
                            <TouchableOpacity
                                key={al.idCliente}
                                style={styles.chip}
                                onPress={() => router.push(`/clientes/${al.idCliente}`)}
                            >
                                <View style={styles.alumnoRow}>
                                    <View style={[styles.miniAvatar, { backgroundColor: al.plan && al.plan !== 'Ninguna' && al.plan !== 'Inactiva' ? Colors.success : Colors.danger }]}>
                                        <Text style={styles.miniAvatarText}>{al.nombre ? al.nombre[0] : 'C'}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={styles.chipTitle}>{al.nombre}</Text>
                                        <Text style={styles.chipSub}>{al.plan || 'Sin plan'} · {al.rutina || 'Sin rutina asignada'}</Text>
                                    </View>
                                    <Text style={{ color: Colors.primary }}>Ver →</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Rutinas */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Rutinas Creadas ({misRutinas.length})</Text>
                    {misRutinas.length === 0 ? (
                        <Text style={styles.empty}>Sin rutinas creadas</Text>
                    ) : (
                        misRutinas.map((r: RutinaItem) => {
                            return (
                                <View key={r.id} style={styles.chip}>
                                    <Text style={styles.chipTitle}>🏋️ {r.nombre}</Text>
                                    <Text style={styles.chipSub}>
                                        {r.idsEjercicios?.length || 0} ejercicios · {r.activa ? 'Activa' : 'Inactiva'}
                                    </Text>
                                    <TouchableOpacity style={{ marginTop: 8 }} onPress={() => router.push(`/clientes/${r.idCliente}`)}>
                                        <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '500' }}>→ Ir al Alumno (ID: {r.idCliente})</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    )}
                </View>

                {/* Acciones */}
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
                    onPress={() => Alert.alert('Asignar Cliente', 'Se conectará al API')}
                >
                    <Text style={styles.actionBtnText}>➕ Asignar Nuevo Cliente</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.danger }]}
                    onPress={() => Alert.alert('Desactivar', 'Se conectará al API')}
                >
                    <Text style={styles.actionBtnText}>⛔ Desactivar Entrenador</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    back: { color: Colors.primary, fontSize: 15 },
    headerTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
    profileCard: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: Colors.border
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
    nombre: { color: Colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    badge: { borderRadius: 8, paddingVertical: 5, paddingHorizontal: 14 },
    badgeText: { color: Colors.black, fontWeight: '600', fontSize: 13 },
    card: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12
    },
    cardTitle: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 10 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    rowLabel: { color: Colors.textMuted, fontSize: 13 },
    rowVal: { color: Colors.text, fontSize: 13, fontWeight: '600' },
    notasText: { color: Colors.text, fontSize: 13, lineHeight: 20 },
    chip: {
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8
    },
    chipTitle: { color: Colors.text, fontWeight: '600', fontSize: 14 },
    chipSub: { color: Colors.textMuted, fontSize: 12, marginTop: 3 },
    alumnoRow: { flexDirection: 'row', alignItems: 'center' },
    miniAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    miniAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    empty: { color: Colors.textMuted, textAlign: 'center', paddingVertical: 10 },
    actionBtn: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 8
    },
    actionBtnText: { color: Colors.black, fontWeight: '700', fontSize: 15 },
});