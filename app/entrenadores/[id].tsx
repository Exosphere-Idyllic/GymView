// app/entrenadores/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import { MOCK_ENTRENADORES, MOCK_CLIENTES, MOCK_RUTINAS } from '../../src/services/mock/mockData';

export default function EntrenadorDetalle() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const entrenador = MOCK_ENTRENADORES.find(e => e.id_entrenador === parseInt(id));

    if (!entrenador) return (
        <SafeAreaView style={styles.safe}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: Colors.text }}>Entrenador no encontrado</Text>
            </View>
        </SafeAreaView>
    );

    const misAlumnos = MOCK_CLIENTES.filter(c => c.id_entrenador === entrenador.id_entrenador);
    const misRutinas = MOCK_RUTINAS.filter(r => r.id_entrenador === entrenador.id_entrenador);

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
                        <Text style={styles.avatarText}>{entrenador.nombre[0]}</Text>
                    </View>
                    <Text style={styles.nombre}>{entrenador.nombre} {entrenador.apellido}</Text>
                    <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
                        <Text style={styles.badgeText}>🏋️ {entrenador.especialidad}</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Información Personal</Text>
                    {[
                        { l: 'Email', v: entrenador.email },
                        { l: 'Especialidad', v: entrenador.especialidad },
                        { l: 'Total Alumnos', v: entrenador.totalAlumnos },
                        { l: 'Rutinas Creadas', v: entrenador.rutinasCreadas },
                    ].map((d, i) => (
                        <View key={i} style={styles.row}>
                            <Text style={styles.rowLabel}>{d.l}</Text>
                            <Text style={styles.rowVal}>{d.v}</Text>
                        </View>
                    ))}
                </View>

                {/* Notas de desempeño */}
                {entrenador.notas_desempeno && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Notas de Desempeño</Text>
                        <Text style={styles.notasText}>{entrenador.notas_desempeno}</Text>
                    </View>
                )}

                {/* Alumnos */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Alumnos Asignados ({misAlumnos.length})</Text>
                    {misAlumnos.length === 0 ? (
                        <Text style={styles.empty}>Sin alumnos asignados</Text>
                    ) : (
                        misAlumnos.map(al => (
                            <TouchableOpacity
                                key={al.id_cliente}
                                style={styles.chip}
                                onPress={() => router.push(`/clientes/${al.id_cliente}`)}
                            >
                                <View style={styles.alumnoRow}>
                                    <View style={[styles.miniAvatar, { backgroundColor: al.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                                        <Text style={styles.miniAvatarText}>{al.nombre[0]}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={styles.chipTitle}>{al.nombre} {al.apellido}</Text>
                                        <Text style={styles.chipSub}>{al.nombrePlan} · {al.estadoMembresia}</Text>
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
                        misRutinas.map(r => {
                            const cliente = MOCK_CLIENTES.find(c => c.id_cliente === r.id_cliente);
                            return (
                                <View key={r.id_rutina} style={styles.chip}>
                                    <Text style={styles.chipTitle}>🏋️ {r.nombre_rutina}</Text>
                                    <Text style={styles.chipSub}>
                                        Para: {cliente?.nombre} {cliente?.apellido} · {r.ejercicios.length} ejercicios
                                    </Text>
                                    <Text style={styles.chipSub}>Creada: {r.fecha_creacion}</Text>
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