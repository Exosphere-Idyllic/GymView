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

    // Círculo de estado como en EscanerRecepcion.html: esperando / entrada / salida / error
    const estadoCirculo = !scanResult
        ? 'esperando'
        : scanResult.ok
            ? (scanResult.msg.includes('Hasta luego') || scanResult.msg.includes('SALIDA') ? 'salida' : 'entrada')
            : 'error';

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>SIMULADOR TORNIQUETE</Text>
                <Text style={styles.headerSub}>Scanner Acceso · Iron Fitness</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Caja central como EscanerRecepcion.html */}
                <View style={styles.scannerBox}>
                    <View style={[
                        styles.statusCircle,
                        estadoCirculo === 'entrada' && styles.statusCircleEntrada,
                        estadoCirculo === 'salida' && styles.statusCircleSalida,
                        estadoCirculo === 'error' && styles.statusCircleError,
                    ]}>
                        <Text style={styles.statusIcon}>
                            {estadoCirculo === 'esperando' && '🔒'}
                            {estadoCirculo === 'entrada' && '👋'}
                            {estadoCirculo === 'salida' && '🚪'}
                            {estadoCirculo === 'error' && '⚠️'}
                        </Text>
                    </View>
                    <Text style={styles.mensajePrincipal}>
                        {scanResult ? scanResult.msg : (procesando ? 'Procesando...' : 'Esperando QR...')}
                    </Text>

                    <View style={styles.inputGroup}>
                        <View style={styles.inputGroupLabel}>
                            <Text style={styles.inputGroupLabelText}>ID</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.inputGroupInput]}
                            placeholder="Ej: 7"
                            placeholderTextColor="#666"
                            value={qrInput}
                            onChangeText={setQrInput}
                            keyboardType="numeric"
                            editable={!procesando}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.simBtn, (scanning || procesando) && styles.simBtnDisabled]}
                        onPress={() => {
                            if (qrInput.trim()) {
                                procesarAcceso(qrInput.trim());
                            } else {
                                simularEscaneo();
                            }
                        }}
                        disabled={scanning || procesando}
                    >
                        {procesando
                            ? <ActivityIndicator color={Colors.black} />
                            : <Text style={styles.simBtnText}>
                                {qrInput.trim() ? '💥 SIMULAR ESCANEO' : '💥 SIMULAR ESCANEO (aleatorio)'}
                            </Text>
                        }
                    </TouchableOpacity>
                </View>

                {/* Resultado detalle */}
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

                    {/* Validar ID manual */}
                    <Text style={styles.sectionTitle}>Ingresar ID manualmente</Text>
                    <Text style={styles.sectionHint}>
                        {useRealApi ? 'id_usuario del cliente (ej: 4)' : 'id_cliente mock (ej: 1)'}
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
    scrollContent: { paddingBottom: 30 },
    header: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14 },
    headerTitle: { color: Colors.primary, fontWeight: 'bold', fontSize: 20 },
    headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    scannerBox: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 16,
        padding: 24,
        margin: 20,
        alignItems: 'center',
    },
    statusCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusCircleEntrada: { backgroundColor: Colors.success },
    statusCircleSalida: { backgroundColor: Colors.danger },
    statusCircleError: { backgroundColor: '#e67700' },
    statusIcon: { fontSize: 32 },
    mensajePrincipal: { color: Colors.textMuted, fontSize: 16, marginBottom: 20, textAlign: 'center' },
    inputGroup: { flexDirection: 'row', width: '100%', marginBottom: 16 },
    inputGroupLabel: {
        backgroundColor: '#444',
        borderWidth: 1,
        borderRightWidth: 0,
        borderColor: '#555',
        paddingHorizontal: 14,
        justifyContent: 'center',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    inputGroupLabelText: { color: Colors.text, fontWeight: '600', fontSize: 14 },
    resultBox: { margin: 16, padding: 16, borderWidth: 2, borderRadius: 12 },
    resultText: { fontWeight: '700', fontSize: 15, textAlign: 'center', lineHeight: 22 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    toggleLabel: { color: Colors.textMuted, fontSize: 13 },
    toggleBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#444', backgroundColor: '#2c2c2c' },
    toggleBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,193,7,0.15)' },
    toggleText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
    toggleTextActive: { color: Colors.primary },
    inputGroupInput: { flex: 1, borderTopRightRadius: 8, borderBottomRightRadius: 8, borderWidth: 1, borderColor: '#555', marginLeft: 0 },
    simBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 18, alignItems: 'center', width: '100%' },
    simBtnDisabled: { opacity: 0.7 },
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