// app/(tabs)/asistencia.tsx
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    TextInput, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import Colors from '../../src/theme/colors';
import asistenciaService, { AccesoResponse } from '../../src/services/asistencia.service';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function AsistenciaScreen() {
    const [scanResult, setScanResult] = useState<null | { ok: boolean; msg: string }>(null);
    const [qrInput, setQrInput] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    // Permitir volver a escanear después de un tiempo
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (scanned) {
            timeout = setTimeout(() => {
                setScanned(false);
                setScanResult(null);
            }, 5000); // 5 segundos de enfriamiento para no registrar doble
        }
        return () => clearTimeout(timeout);
    }, [scanned]);

    if (!permission) {
        // Cargando permisos
        return <View style={styles.safe} />;
    }

    if (!permission.granted) {
        // No hay permisos
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Control de Acceso</Text>
                    <Text style={styles.headerSub}>Scanner Acceso · Iron Fitness</Text>
                </View>
                <View style={styles.containerCenter}>
                    <Text style={styles.mensajePermiso}>Necesitamos acceso a la cámara para escanear los códigos QR.</Text>
                    <TouchableOpacity style={styles.btnPermiso} onPress={requestPermission}>
                        <Text style={styles.btnPermisoText}>Otorgar Permiso</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const procesarAccesoReal = async (idUsuario: number) => {
        if (procesando) return;
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
            setScanned(true);
        }
    };

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned || procesando) return;
        const id = parseInt(data);
        if (isNaN(id) || id <= 0) {
            setScanResult({ ok: false, msg: 'QR inválido. Intenta de nuevo.' });
            setScanned(true);
            return;
        }
        procesarAccesoReal(id);
    };

    const procesarAccesoManual = () => {
        const id = parseInt(qrInput.trim());
        if (isNaN(id) || id <= 0) {
            Alert.alert('', 'Ingresa un ID válido');
            return;
        }
        setQrInput('');
        procesarAccesoReal(id);
    };

    const estadoCirculo = !scanResult
        ? 'esperando'
        : scanResult.ok
            ? (scanResult.msg.includes('SALIDA') ? 'salida' : 'entrada')
            : 'error';

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Control de Acceso</Text>
                <Text style={styles.headerSub}>Scanner Acceso · Iron Fitness</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.scannerBox}>
                    <View style={[
                        styles.statusCircle,
                        estadoCirculo === 'entrada' && styles.statusCircleEntrada,
                        estadoCirculo === 'salida' && styles.statusCircleSalida,
                        estadoCirculo === 'error' && styles.statusCircleError,
                    ]}>
                        <Text style={styles.statusIcon}>
                            {estadoCirculo === 'esperando' && '📷'}
                            {estadoCirculo === 'entrada' && '👋'}
                            {estadoCirculo === 'salida' && '🚪'}
                            {estadoCirculo === 'error' && '⚠️'}
                        </Text>
                    </View>
                    <Text style={styles.mensajePrincipal}>
                        {scanResult ? scanResult.msg : (procesando ? 'Procesando...' : 'Escanea un código QR')}
                    </Text>

                    <View style={styles.cameraContainer}>
                        <CameraView
                            style={styles.camera}
                            facing="back"
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr"],
                            }}
                        />
                        {scanned && (
                            <View style={styles.overlay}>
                                {scanResult && (
                                    <View style={[styles.resultOverlayBox, {
                                        borderColor: scanResult.ok ? Colors.success : Colors.danger,
                                        backgroundColor: scanResult.ok ? 'rgba(26, 61, 43, 0.9)' : 'rgba(61, 26, 26, 0.9)',
                                    }]}>
                                        <Text style={[styles.resultText, { color: scanResult.ok ? Colors.success : Colors.danger }]}>
                                            {scanResult.msg}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {scanned && !procesando && (
                        <TouchableOpacity style={styles.simBtn} onPress={() => { setScanned(false); setScanResult(null); }}>
                             <Text style={styles.simBtnText}>📸 Escanear nuevo código</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ padding: 16 }}>
                    <Text style={styles.sectionTitle}>Ingresar ID manualmente</Text>
                    <Text style={styles.sectionHint}>En caso de problemas con la cámara</Text>
                    
                    <View style={styles.manualRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="ID usuario (ej: 4)"
                            placeholderTextColor="#666"
                            value={qrInput}
                            onChangeText={setQrInput}
                            keyboardType="numeric"
                            editable={!procesando}
                        />
                        <TouchableOpacity
                            style={styles.validateBtn}
                            onPress={procesarAccesoManual}
                            disabled={procesando || !qrInput.trim()}
                        >
                            {procesando
                                ? <ActivityIndicator color={Colors.black} size="small" />
                                : <Text style={styles.validateText}>Validar</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    containerCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    mensajePermiso: { color: Colors.text, textAlign: 'center', marginBottom: 20, fontSize: 16 },
    btnPermiso: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
    btnPermisoText: { color: Colors.black, fontWeight: 'bold', fontSize: 16 },
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
    cameraContainer: {
        width: 250,
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: Colors.primary,
        marginBottom: 20,
        position: 'relative'
    },
    camera: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    resultOverlayBox: {
        padding: 16,
        borderWidth: 2,
        borderRadius: 12,
        width: '80%',
    },
    resultText: { fontWeight: '700', fontSize: 15, textAlign: 'center', lineHeight: 22 },
    simBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 18, alignItems: 'center', width: '100%' },
    simBtnText: { color: Colors.black, fontWeight: '800', fontSize: 16 },
    sectionTitle: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 },
    sectionHint: { color: Colors.textMuted, fontSize: 11, marginBottom: 10 },
    manualRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    input: { flex: 1, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 12, color: Colors.text, fontSize: 15 },
    validateBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
    validateText: { color: Colors.black, fontWeight: '700' },
});