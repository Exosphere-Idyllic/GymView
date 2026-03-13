// app/entrenadores/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import authService, { AdminUsuario } from '../../src/services/auth.service';

export default function EntrenadoresIndex() {
    const router = useRouter();
    const [entrenadores, setEntrenadores] = useState<AdminUsuario[]>([]);
    const [loading, setLoading] = useState(true);

    const cargarEntrenadores = useCallback(async () => {
        try {
            setLoading(true);
            const usuarios = await authService.getUsuariosAdmin();
            const soloEntrenadores = usuarios.filter(u => u.rol?.toLowerCase() === 'entrenador');
            setEntrenadores(soloEntrenadores);
        } catch (e) {
            console.error('Error cargando entrenadores:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarEntrenadores();
    }, [cargarEntrenadores]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.back}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Gestión de Entrenadores</Text>
                <TouchableOpacity
                    onPress={() => router.push('/entrenadores/crear')}
                    style={styles.addBtn}
                >
                    <Text style={styles.addText}>+ Nuevo</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 14 }}>
                {loading ? (
                    <View style={{ marginTop: 40, alignItems: 'center' }}>
                        <ActivityIndicator color={Colors.primary} size="large" />
                        <Text style={{ color: Colors.textMuted, marginTop: 10 }}>Cargando entrenadores...</Text>
                    </View>
                ) : entrenadores.length === 0 ? (
                    <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 40 }}>No hay entrenadores registrados.</Text>
                ) : (
                    entrenadores.map(e => (
                        <TouchableOpacity
                            key={e.id}
                            style={styles.card}
                            onPress={() => router.push(`/entrenadores/${e.id}`)}
                        >
                            <View style={styles.row}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{e.nombre ? e.nombre[0] : 'E'}</Text>
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.name}>{e.nombre} {e.apellido}</Text>
                                    <Text style={styles.sub}>{e.email || 'Sin correo'}</Text>
                                    <Text style={styles.especialidad}>💪 Coach</Text>
                                </View>
                                <View style={styles.statsCol}>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Estado:</Text>
                                        <Text style={[styles.statVal, { color: Colors.success }]}>Activo</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface,
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    back: { color: Colors.primary, fontSize: 15 },
    title: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
    addBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12
    },
    addText: { color: Colors.black, fontWeight: '700', fontSize: 13 },
    card: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 14,
        marginBottom: 10
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1565C0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    name: { color: Colors.text, fontWeight: '600', fontSize: 15 },
    sub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    especialidad: {
        color: Colors.primary,
        fontSize: 11,
        marginTop: 4,
        fontWeight: '600'
    },
    statsCol: { alignItems: 'flex-end' },
    statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    statLabel: { color: Colors.textMuted, fontSize: 11, marginRight: 4 },
    statVal: {
        color: Colors.text,
        fontSize: 13,
        fontWeight: 'bold'
    },
});