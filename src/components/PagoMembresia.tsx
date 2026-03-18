// src/components/PagoMembresia.tsx
// Vista de pago: el usuario elige un método para pagar su membresía.
// - Pago en Recepción: funcional (activa la membresía directamente)
// - Depósito/Transferencia y Tarjeta: muestran pantalla de mantenimiento al proceder

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Modal,
    ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import Colors from '../theme/colors';

export interface PlanSeleccionado {
    id: number;
    nombre: string;
    precio: number;
    dias: number;
}

interface Props {
    visible: boolean;
    plan: PlanSeleccionado | null;
    planActual: string | null;       // nombre del plan actual del usuario
    precioActual: number;            // precio del plan actual
    membresiaActiva: boolean;
    onClose: () => void;
    onPagoRecepcion: (planId: number) => Promise<void>;
}

type MetodoPago = 'recepcion' | 'deposito' | 'tarjeta' | null;
type Vista = 'seleccion' | 'confirmar' | 'mantenimiento';

export default function PagoMembresia({ visible, plan, planActual, precioActual, membresiaActiva, onClose, onPagoRecepcion }: Props) {
    const [metodo, setMetodo] = useState<MetodoPago>(null);
    const [vista, setVista] = useState<Vista>('seleccion');
    const [loading, setLoading] = useState(false);

    if (!plan) return null;

    // Lógica de upgrade/downgrade
    const esUpgrade = membresiaActiva && plan.precio > precioActual;
    const esDowngrade = membresiaActiva && plan.precio < precioActual && planActual !== plan.nombre;
    const esMismoPlan = planActual === plan.nombre;
    const diferencia = esUpgrade ? plan.precio - precioActual : 0;
    const montoAPagar = esUpgrade ? diferencia : plan.precio;

    const handleReset = () => {
        setMetodo(null);
        setVista('seleccion');
        setLoading(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleSeleccionarMetodo = (m: MetodoPago) => {
        setMetodo(m);
        setVista('confirmar');
    };

    const handleProceder = async () => {
        if (metodo === 'deposito' || metodo === 'tarjeta') {
            setVista('mantenimiento');
            return;
        }

        // Pago en recepción — funcional
        if (metodo === 'recepcion') {
            setLoading(true);
            try {
                await onPagoRecepcion(plan.id);
                handleClose();
            } catch (e: any) {
                Alert.alert('Error', e.message || 'No se pudo procesar el pago');
            } finally {
                setLoading(false);
            }
        }
    };

    const metodos: { key: MetodoPago; icon: string; label: string; desc: string }[] = [
        { key: 'recepcion', icon: '🏢', label: 'Pago en Recepción', desc: 'Acércate al gimnasio y paga directamente. La recepcionista validará tu pago.' },
        { key: 'deposito', icon: '🏦', label: 'Depósito / Transferencia', desc: 'Realiza un depósito o transferencia bancaria a nuestras cuentas.' },
        { key: 'tarjeta', icon: '💳', label: 'Tarjeta de Crédito/Débito', desc: 'Paga en línea con tu tarjeta de forma segura e inmediata.' },
    ];

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
            <View style={s.overlay}>
                <View style={s.card}>
                    <ScrollView showsVerticalScrollIndicator={false}>

                        {/* ═══ HEADER ═══ */}
                        <View style={s.header}>
                            <Text style={s.headerIcon}>💰</Text>
                            <Text style={s.headerTitle}>Pagar Membresía</Text>
                            <Text style={s.headerPlan}>{plan.nombre}</Text>
                        </View>

                        {/* ═══ RESUMEN DE PRECIO ═══ */}
                        <View style={s.resumen}>
                            {esUpgrade ? (
                                <>
                                    <Text style={s.resumenLabel}>Upgrade desde {planActual}</Text>
                                    <Text style={s.resumenPrecio}>
                                        Diferencia: <Text style={{ color: Colors.success }}>${diferencia.toFixed(2)}</Text>
                                    </Text>
                                </>
                            ) : esDowngrade ? (
                                <>
                                    <View style={s.alertWarning}>
                                        <Text style={s.alertWarningText}>
                                            ⚠️ Tu plan actual ({planActual}) seguirá activo hasta su fecha de vencimiento. El plan {plan.nombre} se aplicará después automáticamente.
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Text style={s.resumenLabel}>{esMismoPlan ? 'Renovación' : 'Nuevo Plan'}</Text>
                                    <Text style={s.resumenPrecio}>${montoAPagar.toFixed(2)}</Text>
                                    <Text style={s.resumenDias}>{plan.dias} días de acceso</Text>
                                </>
                            )}
                        </View>

                        {/* Si es downgrade, solo mostramos el aviso y un botón de cerrar */}
                        {esDowngrade ? (
                            <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
                                <Text style={s.cancelText}>Entendido</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                {/* ═══ VISTA: SELECCIÓN DE MÉTODO ═══ */}
                                {vista === 'seleccion' && (
                                    <>
                                        <Text style={s.seccionTitle}>Selecciona método de pago</Text>
                                        {metodos.map(m => (
                                            <TouchableOpacity
                                                key={m.key}
                                                style={[s.metodoCard, metodo === m.key && s.metodoCardActive]}
                                                onPress={() => handleSeleccionarMetodo(m.key)}
                                            >
                                                <Text style={s.metodoIcon}>{m.icon}</Text>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={s.metodoLabel}>{m.label}</Text>
                                                    <Text style={s.metodoDesc}>{m.desc}</Text>
                                                </View>
                                                <Text style={{ color: Colors.textMuted, fontSize: 18 }}>›</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                )}

                                {/* ═══ VISTA: CONFIRMAR PAGO ═══ */}
                                {vista === 'confirmar' && (
                                    <>
                                        <View style={s.confirmBox}>
                                            <Text style={s.confirmIcon}>
                                                {metodo === 'recepcion' ? '🏢' : metodo === 'deposito' ? '🏦' : '💳'}
                                            </Text>
                                            <Text style={s.confirmLabel}>
                                                {metodo === 'recepcion' ? 'Pago en Recepción' : metodo === 'deposito' ? 'Depósito / Transferencia' : 'Tarjeta de Crédito/Débito'}
                                            </Text>
                                            <Text style={s.confirmMonto}>Monto: ${montoAPagar.toFixed(2)}</Text>
                                            {metodo === 'recepcion' && (
                                                <Text style={s.confirmHint}>
                                                    Al confirmar, tu membresía se activará y deberás acercarte a recepción para completar el pago presencialmente.
                                                </Text>
                                            )}
                                        </View>

                                        <TouchableOpacity
                                            style={[s.procederBtn, loading && { backgroundColor: '#555' }]}
                                            onPress={handleProceder}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <ActivityIndicator color={Colors.black} />
                                            ) : (
                                                <Text style={s.procederText}>PROCEDER CON EL PAGO</Text>
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity style={s.backBtn} onPress={handleReset}>
                                            <Text style={s.backText}>← Cambiar método</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {/* ═══ VISTA: MANTENIMIENTO ═══ */}
                                {vista === 'mantenimiento' && (
                                    <View style={s.mantenimiento}>
                                        <Text style={s.mantenimientoIcon}>🔧</Text>
                                        <Text style={s.mantenimientoTitle}>Método de pago en mantenimiento</Text>
                                        <Text style={s.mantenimientoDesc}>
                                            Temporalmente este método de pago no se encuentra disponible.{'\n\n'}
                                            Por favor, selecciona <Text style={{ fontWeight: 'bold', color: Colors.primary }}>Pago en Recepción</Text> para activar tu membresía, o contacta a un administrador para más información.
                                        </Text>
                                        <TouchableOpacity style={s.mantenimientoBtn} onPress={handleReset}>
                                            <Text style={s.mantenimientoBtnText}>← Volver a métodos de pago</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}

                        {/* ═══ BOTÓN CERRAR (siempre visible excepto downgrade) ═══ */}
                        {!esDowngrade && (
                            <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
                                <Text style={s.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    card: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 500, maxHeight: '90%' },

    header: { alignItems: 'center', marginBottom: 20 },
    headerIcon: { fontSize: 48, marginBottom: 8 },
    headerTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
    headerPlan: { color: Colors.primary, fontSize: 16, fontWeight: '600', marginTop: 4 },

    resumen: { backgroundColor: Colors.background, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
    resumenLabel: { color: Colors.textMuted, fontSize: 13, marginBottom: 4 },
    resumenPrecio: { color: Colors.text, fontSize: 32, fontWeight: 'bold' },
    resumenDias: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },

    alertWarning: { backgroundColor: '#3d3520', borderWidth: 1, borderColor: Colors.warning, borderRadius: 10, padding: 14 },
    alertWarningText: { color: '#ffc107', fontSize: 13, lineHeight: 20, textAlign: 'center' },

    seccionTitle: { color: Colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },

    metodoCard: {
        backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
        borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    metodoCardActive: { borderColor: Colors.primary },
    metodoIcon: { fontSize: 28 },
    metodoLabel: { color: Colors.text, fontSize: 15, fontWeight: '600' },
    metodoDesc: { color: Colors.textMuted, fontSize: 12, marginTop: 3, lineHeight: 17 },

    confirmBox: { backgroundColor: Colors.background, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
    confirmIcon: { fontSize: 42, marginBottom: 10 },
    confirmLabel: { color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
    confirmMonto: { color: Colors.primary, fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    confirmHint: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },

    procederBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
    procederText: { color: Colors.black, fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },

    backBtn: { alignItems: 'center', paddingVertical: 10 },
    backText: { color: Colors.textMuted, fontSize: 14 },

    // Mantenimiento
    mantenimiento: { alignItems: 'center', paddingVertical: 20 },
    mantenimientoIcon: { fontSize: 64, marginBottom: 16 },
    mantenimientoTitle: { color: Colors.warning, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
    mantenimientoDesc: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    mantenimientoBtn: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
    mantenimientoBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },

    cancelBtn: { marginTop: 12, paddingVertical: 14, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#444' },
    cancelText: { color: Colors.textMuted, fontWeight: '600', fontSize: 14 },
});
