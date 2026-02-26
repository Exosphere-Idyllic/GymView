// app/kiosko.tsx
// Vista Kiosko – Conversión exacta de Kiosko.html | Iron Fitness
// Control de acceso con overlays éxito/error, imágenes por URL, API escanear
// Responsive: Web (desktop) y Mobile (app)

import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    Image, ActivityIndicator, useWindowDimensions, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../src/theme/colors';
import asistenciaService, { AccesoResponse } from '../src/services/asistencia.service';

type OverlayState = 'none' | 'success' | 'error';

export default function KioskoScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const [overlay, setOverlay] = useState<OverlayState>('none');
    const [procesando, setProcesando] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [planUsuario, setPlanUsuario] = useState('');
    const [idInput, setIdInput] = useState('');
    const inputRef = useRef<TextInput>(null);

    const procesarAcceso = async (idUsuario: number) => {
        setProcesando(true);
        setOverlay('none');
        try {
            const res: AccesoResponse = await asistenciaService.escanear(idUsuario);
            setNombreUsuario(res.mensaje?.replace(/^[^\w]*¡?Bienvenido,?\s*/i, '').replace(/!?$/i, '').trim() || 'Socio');
            setPlanUsuario('Membresía Activa');
            setOverlay(res.tipo === 'ENTRADA' ? 'success' : 'success');
            setTimeout(() => setOverlay('none'), 4000);
        } catch (e: any) {
            setOverlay('error');
            setTimeout(() => setOverlay('none'), 4000);
        } finally {
            setProcesando(false);
            setIdInput('');
        }
    };

    const simularAcceso = (ok: boolean) => {
        if (ok) {
            setNombreUsuario('Juan Pérez');
            setPlanUsuario('Plan Black');
            setOverlay('success');
        } else {
            setOverlay('error');
        }
        setTimeout(() => setOverlay('none'), 4000);
    };

    const handleSubmitId = () => {
        const id = parseInt(idInput.replace(/\D/g, ''), 10);
        if (id > 0) {
            procesarAcceso(id);
        } else {
            setOverlay('error');
            setTimeout(() => setOverlay('none'), 3000);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, isDesktop && styles.titleDesktop]}>
                    ⚡ IRON ACCESS
                </Text>
                <Text style={styles.subtitle}>Acerca tu código QR al escáner</Text>
            </View>

            {/* Área scanner */}
            <View style={[styles.scannerContainer, isDesktop && styles.scannerContainerDesktop]}>
                <View style={styles.scanLine} />
                <View style={styles.cameraFeed} />

                <View style={styles.simBar}>
                    <Text style={styles.simLabel}>[MODO SIMULACIÓN]</Text>
                    <View style={styles.simButtons}>
                        <TouchableOpacity
                            style={[styles.simBtnOk, procesando && styles.simBtnDisabled]}
                            onPress={() => simularAcceso(true)}
                            disabled={procesando}
                        >
                            <Text style={styles.simBtnText}>Simular OK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.simBtnErr, procesando && styles.simBtnDisabled]}
                            onPress={() => simularAcceso(false)}
                            disabled={procesando}
                        >
                            <Text style={styles.simBtnText}>Simular Error</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Input oculto para lector de códigos (focus para recibir escaneo) */}
            <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={idInput}
                onChangeText={setIdInput}
                onSubmitEditing={handleSubmitId}
                keyboardType="numeric"
                placeholder=""
            />

            {/* Overlay Éxito */}
            {overlay === 'success' && (
                <View style={[StyleSheet.absoluteFill, styles.overlaySuccess]}>
                    <Image
                        source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreUsuario)}&size=200` }}
                        style={styles.userPhoto}
                    />
                    <View style={styles.statusIconSuccess}>
                        <Text style={styles.statusIconTextSuccess}>✓</Text>
                    </View>
                    <Text style={styles.overlayTitleSuccess}>BIENVENIDO</Text>
                    <Text style={styles.overlaySubtitle}>{nombreUsuario}</Text>
                    <Text style={styles.overlayPlan}>Membresía Activa • {planUsuario}</Text>
                    <View style={styles.badgeSuccess}>
                        <Text style={styles.badgeSuccessText}>Disfruta tu entrenamiento</Text>
                    </View>
                </View>
            )}

            {/* Overlay Error */}
            {overlay === 'error' && (
                <View style={[StyleSheet.absoluteFill, styles.overlayError]}>
                    <View style={styles.statusIconError}>
                        <Text style={styles.statusIconText}>✕</Text>
                    </View>
                    <Text style={styles.overlayTitleError}>ACCESO DENEGADO</Text>
                    <Text style={styles.overlaySubtitle}>Código Inválido o Vencido</Text>
                    <Text style={styles.overlayMsg}>Por favor, dirígete a recepción</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => setOverlay('none')}>
                        <Text style={styles.retryBtnText}>Intentar de nuevo</Text>
                    </TouchableOpacity>
                </View>
            )}

            {procesando && (
                <View style={[StyleSheet.absoluteFill, styles.processingOverlay]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.processingText}>Procesando...</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Iron Fitness System v1.0 • Terminal ID: KIOSK-01</Text>
                <Text style={styles.footerSub}>Conectado</Text>
            </View>

            <TouchableOpacity style={styles.exitBtn} onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.exitBtnText}>Salir</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { alignItems: 'center', paddingTop: 40, paddingBottom: 20 },
    title: { color: Colors.text, fontWeight: 'bold', fontSize: 28 },
    titleDesktop: { fontSize: 36 },
    subtitle: { color: Colors.textMuted, fontSize: 16, marginTop: 8 },
    scannerContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginVertical: 10,
        backgroundColor: '#111',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#333',
        overflow: 'hidden',
        position: 'relative',
    },
    scannerContainerDesktop: { maxWidth: 800, alignSelf: 'center', width: '100%' },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: Colors.primary,
        top: '50%',
        opacity: 0.6,
        zIndex: 1,
    },
    cameraFeed: { flex: 1 },
    simBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        padding: 12,
        alignItems: 'center',
    },
    simLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 8 },
    simButtons: { flexDirection: 'row', gap: 12 },
    simBtnOk: { backgroundColor: Colors.success, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
    simBtnErr: { backgroundColor: Colors.danger, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
    simBtnDisabled: { opacity: 0.5 },
    simBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        height: 1,
        width: 1,
        left: -9999,
    },
    overlaySuccess: {
        backgroundColor: 'rgba(25, 135, 84, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    overlayError: {
        backgroundColor: 'rgba(220, 53, 69, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    userPhoto: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
    statusIconSuccess: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    statusIconError: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    statusIconText: { fontSize: 32, color: Colors.danger, fontWeight: 'bold' },
    statusIconTextSuccess: { fontSize: 32, color: Colors.success, fontWeight: 'bold' },
    overlayTitleSuccess: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
    overlayTitleError: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
    overlaySubtitle: { color: '#fff', fontSize: 22, marginBottom: 8 },
    overlayPlan: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 16 },
    overlayMsg: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 20 },
    badgeSuccess: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 24 },
    badgeSuccessText: { color: Colors.success, fontSize: 16, fontWeight: '600' },
    retryBtn: { borderWidth: 2, borderColor: '#fff', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 24 },
    retryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    processingOverlay: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99,
    },
    processingText: { color: Colors.text, marginTop: 12, fontSize: 16 },
    footer: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#222' },
    footerText: { color: Colors.textMuted, fontSize: 12 },
    footerSub: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
    exitBtn: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 16 : 50,
        right: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: Colors.textMuted,
        borderRadius: 8,
    },
    exitBtnText: { color: Colors.textMuted, fontSize: 13 },
});
