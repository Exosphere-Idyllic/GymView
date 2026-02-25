// app/entrenadores/index.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import { MOCK_ENTRENADORES } from '../../src/services/mock/mockData';

export default function EntrenadoresIndex() {
    const router = useRouter();

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
                {MOCK_ENTRENADORES.map(e => (
                    <TouchableOpacity
                        key={e.id_entrenador}
                        style={styles.card}
                        onPress={() => router.push(`/entrenadores/${e.id_entrenador}`)}
                    >
                        <View style={styles.row}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{e.nombre[0]}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.name}>{e.nombre} {e.apellido}</Text>
                                <Text style={styles.sub}>{e.email}</Text>
                                <Text style={styles.especialidad}>💪 {e.especialidad}</Text>
                            </View>
                            <View style={styles.statsCol}>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Alumnos:</Text>
                                    <Text style={styles.statVal}>{e.totalAlumnos}</Text>
                                </View>
                                <View style={styles.statRow}>
                                    <Text style={styles.statLabel}>Rutinas:</Text>
                                    <Text style={styles.statVal}>{e.rutinasCreadas}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
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