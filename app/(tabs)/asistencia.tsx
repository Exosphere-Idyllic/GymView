// app/(tabs)/asistencia.tsx
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    TextInput, ScrollView, Alert, Platform, ActivityIndicator,
} from 'react-native';
import Colors from '../../src/theme/colors';
import { MOCK_CLIENTES } from '../../src/services/mock/mockData';
import asistenciaService, { AccesoResponse } from '../../src/services/asistencia.service';

export default function AsistenciaScreen() {
    const [scanResult, setScanResult] = useState<null | { ok: boolean; msg: string }>(null);
    const [qrInput, setQrInput] = useState('');
    const [scanning, setScanning] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [useRealApi, setUseRealApi] = useState(true);

    const procesarAccesoReal = async (idUsuario: number) => {
        setProcesando(true);
        try {
            const res: AccesoResponse = await asistenciaService.escanear(idUsuario);
            const esEntrada = res.tipo === 'ENTRADA';
            setScanResult({
                ok: true,
                msg: res.mensaje || (esEntrada ? `✅ ENTRADA registrada` : `👋 SALIDA registrada`),
            });
        } catch (e: any) {
            setScanResult({ ok: false, msg: `❌ Error: ${e.message}` });
        } finally {
            setProcesando(false);
            setTimeout(() => setScanResult(null), 5000);
        }
    };

    const procesarAccesoMock = (idStr: string) => {
        const id = parseInt(idStr);
        // En mock los IDs son id_cliente; para producción se usa id_usuario
        const cliente = MOCK_CLIENTES.find(c => c.id_cliente === id || c.id_usuario === id);
        if (!cliente) {
            setScanResult({ ok: false, msg: `❌ ACCESO DENEGADO\nID ${id} no encontrado` });
        } else if (cliente.estadoMembresia === 'Vencida') {
            setScanResult({ ok: false, msg: `⚠️ MEMBRESÍA VENCIDA\n${cliente.nombre} ${cliente.apellido}\nDirigirse a recepción` });
        } else {
            setScanResult({ ok: true, msg: `✅ ACCESO PERMITIDO\n¡Bienvenido!\n${cliente.nombre} ${cliente.apellido}\n${cliente.nombrePlan}` });
        }
        setTimeout(() => setScanResult(null), 5000);
    };

    const procesarAcceso = (idStr: string) => {
        const id = parseInt(idStr);
        if (isNaN(id) || id <= 0) {
            Alert.alert('', 'Ingresa un ID válido');
            return;
        }
        setQrInput('');
        if (useRealApi) {
            procesarAccesoReal(id);
        } else {
            procesarAccesoMock(idStr);
        }
    };

    const simularEscaneo = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            const rand = MOCK_CLIENTES[Math.floor(Math.random() * MOCK_CLIENTES.length)];
            // id_usuario es lo que el backend espera
            procesarAcceso(String(rand.id_usuario));
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📷 Control de Acceso QR</Text>
                <Text style={styles.headerSub}>RF06 · {Platform.OS === 'web' ? 'Modo Web' : 'Mobile'}</Text>
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
                        {scanning ? 'Escaneando...' : procesando ? 'Procesando...' : 'Listo para escanear'}
                    </Text>
                </View>

                {/* Resultado */}
                {scanResult && (
                    <View style={[styles.resultBox, {
                        borderColor: scanResult.ok ? Colors.success : Colors.danger,
                        backgroundColor: scanResult.ok ? '#1a3d2b' : '#3d1a1a',
                    }]}>
                        <Text style={[styles.resultText, { color: scanResult.ok ? Colors.success : Colors.danger }]}>
                            {scanResult.msg}
                        </Text>
                    </View>
                )}

                <View style={{ padding: 16 }}>
                    {/* Toggle API/Mock */}
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Fuente:</Text>
                        <TouchableOpacity
                            style={[styles.toggleBtn, useRealApi && styles.toggleBtnActive]}
                            onPress={() => setUseRealApi(true)}
                        >
                            <Text style={[styles.toggleText, useRealApi && styles.toggleTextActive]}>🟢 API Real</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, !useRealApi && styles.toggleBtnActive]}
                            onPress={() => setUseRealApi(false)}
                        >
                            <Text style={[styles.toggleText, !useRealApi && styles.toggleTextActive]}>🔵 Mock</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botón simular */}
                    <TouchableOpacity
                        style={styles.simBtn}
                        onPress={simularEscaneo}
                        disabled={scanning || procesando}
                    >
                        {procesando
                            ? <ActivityIndicator color={Colors.black} />
                            : <Text style={styles.simBtnText}>{scanning ? '⏳ Procesando...' : '🎯 SIMULAR ESCANEO ALEATORIO'}</Text>
                        }
                    </TouchableOpacity>

                    {/* Manual */}
                    <Text style={styles.sectionTitle}>Ingresar ID manualmente</Text>
                    <Text style={styles.sectionHint}>
                        {useRealApi ? 'Ingresa el id_usuario del cliente' : 'Ingresa el id_cliente (mock)'}
                    </Text>
                    <View style={styles.manualRow}>
                        <TextInput
                            style={styles.input}
                            placeholder={useRealApi ? "ID usuario (ej: 4)" : "ID cliente (ej: 1)"}
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
                            disabled={procesando}
                        >
                            {procesando
                                ? <ActivityIndicator color={Colors.black} size="small" />
                                : <Text style={styles.validateText}>Validar</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Clientes de referencia */}
                    <Text style={styles.sectionTitle}>Clientes registrados (mock referencia)</Text>
                    <Text style={styles.sectionHint}>Tap para probar con ID de usuario</Text>
                    {MOCK_CLIENTES.map(c => (
                        <TouchableOpacity
                            key={c.id_cliente}
                            style={styles.clienteRow}
                            onPress={() => procesarAcceso(String(c.id_usuario))}
                            disabled={procesando}
                        >
                            <View style={[styles.avatar, { backgroundColor: c.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                                <Text style={styles.avatarText}>{c.nombre[0]}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={styles.clienteNombre}>{c.nombre} {c.apellido}</Text>
                                <Text style={styles.clienteSub}>{c.nombrePlan} · {c.estadoMembresia}</Text>
                                <Text style={[styles.clienteSub, { color: '#666', fontSize: 11 }]}>
                                    id_usuario: {c.id_usuario} · id_cliente: {c.id_cliente}
                                </Text>
                            </View>
                            <Text style={{ color: Colors.primary, fontSize: 12, fontWeight: '600' }}>
                                {procesando ? '⏳' : 'Scan →'}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {useRealApi && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>
                                ℹ️ En producción el backend usa <Text style={{ color: Colors.primary }}>id_usuario</Text>.
                                Los usuarios reales del backend: recep=id_usuario:2, coach=3, juan=4, etc.
                            </Text>
                        </View>
                    )}
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
    scannerFrame: { width: 220, height: 220, borderRadius: 16, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
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
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    toggleLabel: { color: Colors.textMuted, fontSize: 13 },
    toggleBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#444', backgroundColor: '#2c2c2c' },
    toggleBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,193,7,0.15)' },
    toggleText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
    toggleTextActive: { color: Colors.primary },
    simBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 20 },
    simBtnText: { color: Colors.black, fontWeight: '800', fontSize: 16 },
    sectionTitle: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 },
    sectionHint: { color: Colors.textMuted, fontSize: 11, marginBottom: 10 },
    manualRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    input: { flex: 1, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 12, color: Colors.text, fontSize: 15 },
    validateBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
    validateText: { color: Colors.black, fontWeight: '700' },
    clienteRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    clienteNombre: { color: Colors.text, fontWeight: '600', fontSize: 14 },
    clienteSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    infoBox: { backgroundColor: '#1a1a1a', borderLeftWidth: 3, borderLeftColor: Colors.primary, borderRadius: 8, padding: 12, marginTop: 12 },
    infoText: { color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
});