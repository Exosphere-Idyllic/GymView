// app/(tabs)/asistencia.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert, Platform } from 'react-native';
import Colors from '../../src/theme/colors';
import { MOCK_CLIENTES, MOCK_ASISTENCIAS } from '../../src/services/mock/mockData';

export default function AsistenciaScreen() {
    const [scanResult, setScanResult] = useState<null | { ok: boolean; msg: string }>(null);
    const [qrInput, setQrInput] = useState('');
    const [scanning, setScanning] = useState(false);

    const procesarAcceso = (idStr: string) => {
        const id = parseInt(idStr);
        const cliente = MOCK_CLIENTES.find(c => c.id_cliente === id);
        if (!cliente) {
            setScanResult({ ok: false, msg: `❌ ACCESO DENEGADO\nID ${id} no encontrado` });
        } else if (cliente.estadoMembresia === 'Vencida') {
            setScanResult({ ok: false, msg: `⚠️ MEMBRESÍA VENCIDA\n${cliente.nombre} ${cliente.apellido}\nDirigirse a recepción` });
        } else {
            setScanResult({ ok: true, msg: `✅ ACCESO PERMITIDO\n¡Bienvenido!\n${cliente.nombre} ${cliente.apellido}\n${cliente.nombrePlan}` });
        }
        setQrInput('');
        setTimeout(() => setScanResult(null), 5000);
    };

    const simularEscaneo = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            const rand = MOCK_CLIENTES[Math.floor(Math.random() * MOCK_CLIENTES.length)];
            procesarAcceso(String(rand.id_cliente));
        }, 1500);
    };

    const asistenciasHoy = MOCK_ASISTENCIAS.filter(a => a.fecha_hora_ingreso.startsWith('2026-02-18'));

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📷 Control de Acceso QR</Text>
                <Text style={styles.headerSub}>RF06 - Escaneo de asistencia {Platform.OS === 'web' && '(Modo Simulación Web)'}</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Scanner visual */}
                <View style={styles.scannerArea}>
                    <View style={[styles.scannerFrame, scanning && styles.scannerActive]}>
                        <Text style={{ fontSize: 80 }}>📷</Text>
                        <View style={[styles.corner, styles.tl]} />
                        <View style={[styles.corner, styles.tr]} />
                        <View style={[styles.corner, styles.bl]} />
                        <View style={[styles.corner, styles.br]} />
                        {scanning && <View style={styles.scanLine} />}
                    </View>
                    <Text style={styles.scannerLabel}>
                        {scanning ? 'Escaneando...' : Platform.OS === 'web' ? 'Simulador QR (Web)' : 'Listo para escanear'}
                    </Text>
                </View>

                {/* Resultado */}
                {scanResult && (
                    <View style={[styles.resultBox, { borderColor: scanResult.ok ? Colors.success : Colors.danger, backgroundColor: scanResult.ok ? '#1a3d2b' : '#3d1a1a' }]}>
                        <Text style={[styles.resultText, { color: scanResult.ok ? Colors.success : Colors.danger }]}>{scanResult.msg}</Text>
                    </View>
                )}

                <View style={{ padding: 16 }}>
                    {/* Botón simular */}
                    <TouchableOpacity style={styles.simBtn} onPress={simularEscaneo} disabled={scanning}>
                        <Text style={styles.simBtnText}>{scanning ? '⏳ Procesando...' : '🎯 SIMULAR ESCANEO ALEATORIO'}</Text>
                    </TouchableOpacity>

                    {/* Manual */}
                    <Text style={styles.sectionTitle}>O ingresa ID manualmente</Text>
                    <View style={styles.manualRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="ID del cliente (ej: 1)"
                            placeholderTextColor="#666"
                            value={qrInput}
                            onChangeText={setQrInput}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity
                            style={styles.validateBtn}
                            onPress={() => {
                                if (qrInput) procesarAcceso(qrInput);
                                else Alert.alert('', 'Ingresa un ID');
                            }}
                        >
                            <Text style={styles.validateText}>Validar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Clientes para probar */}
                    <Text style={styles.sectionTitle}>Clientes registrados</Text>
                    {MOCK_CLIENTES.map(c => (
                        <TouchableOpacity key={c.id_cliente} style={styles.clienteRow} onPress={() => procesarAcceso(String(c.id_cliente))}>
                            <View style={[styles.avatar, { backgroundColor: c.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                                <Text style={styles.avatarText}>{c.nombre[0]}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.clienteNombre}>{c.nombre} {c.apellido}</Text>
                                <Text style={styles.clienteSub}>{c.nombrePlan} · {c.estadoMembresia}</Text>
                            </View>
                            <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: '600' }}>Escanear →</Text>
                        </TouchableOpacity>
                    ))}

                    {/* Asistencias del día */}
                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Asistencias de Hoy ({asistenciasHoy.length})</Text>
                    {asistenciasHoy.map(a => {
                        const c = MOCK_CLIENTES.find(cl => cl.id_cliente === a.id_cliente);
                        return (
                            <View key={a.id_asistencia} style={styles.clienteRow}>
                                <Text style={{ fontSize: 24 }}>{a.fecha_hora_salida ? '🚪' : '🏃'}</Text>
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.clienteNombre}>{c?.nombre} {c?.apellido}</Text>
                                    <Text style={styles.clienteSub}>
                                        Entrada: {new Date(a.fecha_hora_ingreso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                                        {a.fecha_hora_salida ? ` · Salida: ${new Date(a.fecha_hora_salida).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}` : ' · Dentro del gimnasio'}
                                    </Text>
                                </View>
                                <Text style={{ color: a.fecha_hora_salida ? Colors.textMuted : Colors.success, fontSize: 12 }}>
                                    {a.fecha_hora_salida ? 'Salida' : 'Activo'}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 18 },
    headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    scannerArea: { backgroundColor: '#000', padding: 30, alignItems: 'center' },
    scannerFrame: {
        width: 220, height: 220, borderRadius: 16, backgroundColor: '#111',
        justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden',
    },
    scannerActive: { borderWidth: 2, borderColor: Colors.primary },
    scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: Colors.primary, top: '50%', opacity: 0.8 },
    corner: { position: 'absolute', width: 24, height: 24, borderColor: Colors.primary },
    tl: { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3 },
    tr: { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3 },
    bl: { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3 },
    br: { bottom: 8, right: 8, borderBottomWidth: 3, borderRightWidth: 3 },
    scannerLabel: { color: Colors.textMuted, marginTop: 14, fontSize: 14 },
    resultBox: { margin: 16, padding: 16, borderWidth: 2, borderRadius: 12 },
    resultText: { fontWeight: '700', fontSize: 15, textAlign: 'center', lineHeight: 22 },
    simBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 20 },
    simBtnText: { color: Colors.black, fontWeight: '800', fontSize: 16 },
    sectionTitle: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 10 },
    manualRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    input: { flex: 1, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 12, color: Colors.text, fontSize: 15 },
    validateBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
    validateText: { color: Colors.black, fontWeight: '700' },
    clienteRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    clienteNombre: { color: Colors.text, fontWeight: '600', fontSize: 14 },
    clienteSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
});