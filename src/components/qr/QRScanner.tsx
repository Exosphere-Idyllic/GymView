// src/components/qr/QRScanner.tsx

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { QRData, QRValidationResponse } from '../../types/database.types';

/**
 * Componente Scanner QR
 * Implementa RF06 - Control de Asistencia mediante Código QR
 */

interface QRScannerProps {
    onScanSuccess: (data: QRValidationResponse) => void;
    onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || isProcessing) return;

        setScanned(true);
        setIsProcessing(true);

        try {
            // Parsear datos del QR
            const qrData: QRData = JSON.parse(data);

            // Validar estructura del QR
            if (!qrData.id_cliente || !qrData.codigo || !qrData.timestamp) {
                throw new Error('QR inválido');
            }

            // Validar expiración (5 minutos)
            const now = Date.now();
            if (now > qrData.expiracion) {
                throw new Error('QR expirado');
            }

            // Aquí llamarías al servicio de asistencia para validar en backend
            // const result = await asistenciaService.validateQR(qrData);

            // Mock response para desarrollo
            const mockResult: QRValidationResponse = {
                valido: true,
                mensaje: 'Asistencia registrada correctamente',
                asistencia: {
                    id_asistencia: Math.floor(Math.random() * 1000),
                    id_cliente: qrData.id_cliente,
                    fecha_hora_ingreso: new Date(),
                    dispositivo_qr: 'Mobile App',
                    codigo_validado: qrData.codigo,
                },
            };

            onScanSuccess(mockResult);
            Alert.alert('✅ Éxito', mockResult.mensaje);
        } catch (error: any) {
            Alert.alert('❌ Error', error.message || 'Error al procesar QR');
            setScanned(false); // Permitir escanear nuevamente
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRescan = () => {
        setScanned(false);
        setIsProcessing(false);
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Solicitando permisos de cámara...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    Se necesita permiso de cámara para escanear códigos QR
                </Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Otorgar Permiso</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <Modal visible animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <CameraView
                    style={styles.camera}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                >
                    {/* Overlay */}
                    <View style={styles.overlay}>
                        {/* Top bar */}
                        <View style={styles.topBar}>
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Center - QR Frame */}
                        <View style={styles.scanArea}>
                            <View style={styles.qrFrame}>
                                {/* Corners */}
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />

                                {isProcessing && (
                                    <View style={styles.processingOverlay}>
                                        <Text style={styles.processingText}>Procesando...</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Bottom instructions */}
                        <View style={styles.bottomBar}>
                            <Text style={styles.instructionText}>
                                {scanned
                                    ? 'Código escaneado'
                                    : 'Posiciona el código QR dentro del marco'}
                            </Text>

                            {scanned && (
                                <TouchableOpacity
                                    style={styles.rescanButton}
                                    onPress={handleRescan}
                                    disabled={isProcessing}
                                >
                                    <Text style={styles.rescanButtonText}>
                                        Escanear otro código
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </CameraView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    message: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        padding: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        margin: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        paddingTop: 50,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    scanArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrFrame: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#fff',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomBar: {
        padding: 20,
        paddingBottom: 50,
        alignItems: 'center',
    },
    instructionText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    rescanButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    rescanButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});