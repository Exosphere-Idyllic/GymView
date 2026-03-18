// src/components/PagoMembresia.tsx
// Vista de pago: el usuario elige un método para pagar su membresía.
// - Pago en Recepción: funcional (activa la membresía directamente)
// - Depósito/Transferencia: formulario completo → mantenimiento al enviar
// - Tarjeta: formulario completo → mantenimiento al enviar

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Modal,
    ActivityIndicator, Alert, ScrollView, TextInput,
} from 'react-native';
import Colors from '../theme/colors';
import cuentasBancariasService, { CuentaBancaria } from '../services/cuentasBancarias.service';

export interface PlanSeleccionado {
    id: number;
    nombre: string;
    precio: number;
    dias: number;
}

interface Props {
    visible: boolean;
    plan: PlanSeleccionado | null;
    planActual: string | null;
    precioActual: number;
    membresiaActiva: boolean;
    onClose: () => void;
    onPagoRecepcion: (planId: number) => Promise<void>;
}

type MetodoPago = 'recepcion' | 'deposito' | 'tarjeta' | null;
type Vista = 'seleccion' | 'confirmar' | 'formDeposito' | 'formTarjeta' | 'mantenimiento';

const TIPOS_TRANSFERENCIA = [
    'TRANSFERENCIA DE OTRAS ENTIDADES BANCARIAS NACIONALES',
    'TRANSFERENCIA DE UN BANCO DEL EXTERIOR',
    'TRANSFERENCIA DEL PROPIO BANCO',
];

export default function PagoMembresia({ visible, plan, planActual, precioActual, membresiaActiva, onClose, onPagoRecepcion }: Props) {
    const [metodo, setMetodo] = useState<MetodoPago>(null);
    const [vista, setVista] = useState<Vista>('seleccion');
    const [loading, setLoading] = useState(false);

    // ── Estado formulario Depósito/Transferencia ──
    const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
    const [loadingCuentas, setLoadingCuentas] = useState(false);
    const [cuentaSel, setCuentaSel] = useState<number | null>(null);
    const [motivo, setMotivo] = useState('');
    const [esDeposito, setEsDeposito] = useState(true);
    const [tipoTransferencia, setTipoTransferencia] = useState(TIPOS_TRANSFERENCIA[0]);

    // ── Estado formulario Tarjeta ──
    const [numTarjeta, setNumTarjeta] = useState('');
    const [nombreTarjeta, setNombreTarjeta] = useState('');
    const [fechaExp, setFechaExp] = useState('');
    const [cvv, setCvv] = useState('');

    if (!plan) return null;

    const esUpgrade = membresiaActiva && plan.precio > precioActual;
    const esDowngrade = membresiaActiva && plan.precio < precioActual && planActual !== plan.nombre;
    const esMismoPlan = planActual === plan.nombre;
    const diferencia = esUpgrade ? plan.precio - precioActual : 0;
    const montoAPagar = esUpgrade ? diferencia : plan.precio;

    const handleReset = () => {
        setMetodo(null);
        setVista('seleccion');
        setLoading(false);
        setCuentaSel(null);
        setMotivo('');
        setEsDeposito(true);
        setTipoTransferencia(TIPOS_TRANSFERENCIA[0]);
        setNumTarjeta('');
        setNombreTarjeta('');
        setFechaExp('');
        setCvv('');
    };

    const handleClose = () => { handleReset(); onClose(); };

    const cargarCuentasBancarias = async () => {
        setLoadingCuentas(true);
        try {
            const data = await cuentasBancariasService.listarActivas();
            setCuentas(data);
        } catch { setCuentas([]); }
        finally { setLoadingCuentas(false); }
    };

    const handleSeleccionarMetodo = (m: MetodoPago) => {
        setMetodo(m);
        if (m === 'recepcion') {
            setVista('confirmar');
        } else if (m === 'deposito') {
            cargarCuentasBancarias();
            setVista('formDeposito');
        } else if (m === 'tarjeta') {
            setVista('formTarjeta');
        }
    };

    // ── Enviar formulario de Depósito/Transferencia → Mantenimiento ──
    const handleEnviarDeposito = () => {
        if (!cuentaSel) { Alert.alert('Requerido', 'Selecciona una cuenta bancaria de destino.'); return; }
        if (!motivo.trim()) { Alert.alert('Requerido', 'Ingresa el motivo o uso del depósito/transferencia.'); return; }
        setVista('mantenimiento');
    };

    // ── Enviar formulario de Tarjeta → Mantenimiento ──
    const handleEnviarTarjeta = () => {
        if (!numTarjeta.trim() || numTarjeta.replace(/\s/g, '').length < 13) {
            Alert.alert('Requerido', 'Ingresa un número de tarjeta válido.'); return;
        }
        if (!nombreTarjeta.trim()) { Alert.alert('Requerido', 'Ingresa el nombre del titular.'); return; }
        if (!fechaExp.trim() || !/^\d{2}\/\d{2}$/.test(fechaExp)) {
            Alert.alert('Requerido', 'Ingresa la fecha de expiración (MM/YY).'); return;
        }
        if (!cvv.trim() || cvv.length < 3) { Alert.alert('Requerido', 'Ingresa un CVV válido.'); return; }
        setVista('mantenimiento');
    };

    const handleProceder = async () => {
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

    // ── Sección reutilizable: Resumen del precio ──
    const renderResumen = () => (
        <View style={s.resumen}>
            {esUpgrade ? (
                <>
                    <Text style={s.resumenLabel}>Upgrade desde {planActual}</Text>
                    <Text style={s.resumenPrecio}>
                        Diferencia: <Text style={{ color: Colors.success }}>${diferencia.toFixed(2)}</Text>
                    </Text>
                </>
            ) : esDowngrade ? (
                <View style={s.alertWarning}>
                    <Text style={s.alertWarningText}>
                        ⚠️ Tu plan actual ({planActual}) seguirá activo hasta su fecha de vencimiento. El plan {plan.nombre} se aplicará después automáticamente.
                    </Text>
                </View>
            ) : (
                <>
                    <Text style={s.resumenLabel}>{esMismoPlan ? 'Renovación' : 'Nuevo Plan'}</Text>
                    <Text style={s.resumenPrecio}>${montoAPagar.toFixed(2)}</Text>
                    <Text style={s.resumenDias}>{plan.dias} días de acceso</Text>
                </>
            )}
        </View>
    );

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

                        {renderResumen()}

                        {esDowngrade ? (
                            <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
                                <Text style={s.cancelText}>Entendido</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                {/* ═══ SELECCIÓN DE MÉTODO ═══ */}
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

                                {/* ═══ CONFIRMAR RECEPCIÓN ═══ */}
                                {vista === 'confirmar' && metodo === 'recepcion' && (
                                    <>
                                        <View style={s.confirmBox}>
                                            <Text style={s.confirmIcon}>🏢</Text>
                                            <Text style={s.confirmLabel}>Pago en Recepción</Text>
                                            <Text style={s.confirmMonto}>Monto: ${montoAPagar.toFixed(2)}</Text>
                                            <Text style={s.confirmHint}>
                                                Al confirmar, tu membresía se activará y deberás acercarte a recepción para completar el pago presencialmente.
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[s.procederBtn, loading && { backgroundColor: '#555' }]}
                                            onPress={handleProceder}
                                            disabled={loading}
                                        >
                                            {loading
                                                ? <ActivityIndicator color={Colors.black} />
                                                : <Text style={s.procederText}>CONFIRMAR PAGO EN RECEPCIÓN</Text>
                                            }
                                        </TouchableOpacity>
                                        <TouchableOpacity style={s.backBtn} onPress={handleReset}>
                                            <Text style={s.backText}>← Cambiar método</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {/* ═══ FORMULARIO DEPÓSITO / TRANSFERENCIA ═══ */}
                                {vista === 'formDeposito' && (
                                    <>
                                        <Text style={s.seccionTitle}>🏦 Depósito / Transferencia</Text>

                                        {/* Selección de cuenta */}
                                        <Text style={s.formLabel}>Cuenta bancaria destino</Text>
                                        {loadingCuentas ? (
                                            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} />
                                        ) : cuentas.length === 0 ? (
                                            <Text style={{ color: Colors.textMuted, fontSize: 13, marginBottom: 12 }}>
                                                No hay cuentas bancarias disponibles. Contacta al administrador.
                                            </Text>
                                        ) : (
                                            cuentas.map(c => (
                                                <TouchableOpacity
                                                    key={c.idCuenta}
                                                    style={[s.cuentaOption, cuentaSel === c.idCuenta && s.cuentaOptionActive]}
                                                    onPress={() => setCuentaSel(c.idCuenta)}
                                                >
                                                    <View style={[s.radio, cuentaSel === c.idCuenta && s.radioActive]} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={s.cuentaBanco}>{c.nombreBanco}</Text>
                                                        <Text style={s.cuentaNum}>{c.numeroCuenta} · {c.tipoCuenta}</Text>
                                                        <Text style={s.cuentaTitular}>Titular: {c.titular}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        )}

                                        {/* Motivo */}
                                        <Text style={s.formLabel}>Motivo o uso del depósito/transferencia</Text>
                                        <TextInput
                                            style={s.formInput}
                                            placeholder="Ej: Pago de membresía mensual"
                                            placeholderTextColor={Colors.textMuted}
                                            value={motivo}
                                            onChangeText={setMotivo}
                                            multiline
                                        />

                                        {/* Toggle Depósito / No depósito */}
                                        <Text style={s.formLabel}>¿Es un depósito?</Text>
                                        <View style={s.toggleRow}>
                                            <TouchableOpacity
                                                style={[s.toggleBtn, esDeposito && s.toggleBtnActive]}
                                                onPress={() => setEsDeposito(true)}
                                            >
                                                <Text style={[s.toggleText, esDeposito && s.toggleTextActive]}>Sí</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[s.toggleBtn, !esDeposito && s.toggleBtnActive]}
                                                onPress={() => setEsDeposito(false)}
                                            >
                                                <Text style={[s.toggleText, !esDeposito && s.toggleTextActive]}>No</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Tipo de transferencia (solo si NO es depósito) */}
                                        {!esDeposito && (
                                            <>
                                                <Text style={s.formLabel}>Tipo de Transferencia</Text>
                                                {TIPOS_TRANSFERENCIA.map(tipo => (
                                                    <TouchableOpacity
                                                        key={tipo}
                                                        style={[s.cuentaOption, tipoTransferencia === tipo && s.cuentaOptionActive]}
                                                        onPress={() => setTipoTransferencia(tipo)}
                                                    >
                                                        <View style={[s.radio, tipoTransferencia === tipo && s.radioActive]} />
                                                        <Text style={{ color: Colors.text, fontSize: 13, flex: 1 }}>{tipo}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </>
                                        )}

                                        <TouchableOpacity style={s.procederBtn} onPress={handleEnviarDeposito}>
                                            <Text style={s.procederText}>ENVIAR SOLICITUD DE PAGO</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={s.backBtn} onPress={handleReset}>
                                            <Text style={s.backText}>← Cambiar método</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {/* ═══ FORMULARIO TARJETA ═══ */}
                                {vista === 'formTarjeta' && (
                                    <>
                                        <Text style={s.seccionTitle}>💳 Tarjeta de Crédito/Débito</Text>

                                        <Text style={s.formLabel}>Número de tarjeta</Text>
                                        <TextInput
                                            style={s.formInput}
                                            placeholder="0000 0000 0000 0000"
                                            placeholderTextColor={Colors.textMuted}
                                            value={numTarjeta}
                                            onChangeText={setNumTarjeta}
                                            keyboardType="number-pad"
                                            maxLength={19}
                                        />

                                        <Text style={s.formLabel}>Nombre del titular</Text>
                                        <TextInput
                                            style={s.formInput}
                                            placeholder="Como aparece en la tarjeta"
                                            placeholderTextColor={Colors.textMuted}
                                            value={nombreTarjeta}
                                            onChangeText={setNombreTarjeta}
                                        />

                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.formLabel}>Expiración</Text>
                                                <TextInput
                                                    style={s.formInput}
                                                    placeholder="MM/YY"
                                                    placeholderTextColor={Colors.textMuted}
                                                    value={fechaExp}
                                                    onChangeText={setFechaExp}
                                                    keyboardType="number-pad"
                                                    maxLength={5}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.formLabel}>CVV</Text>
                                                <TextInput
                                                    style={s.formInput}
                                                    placeholder="***"
                                                    placeholderTextColor={Colors.textMuted}
                                                    value={cvv}
                                                    onChangeText={setCvv}
                                                    keyboardType="number-pad"
                                                    maxLength={4}
                                                    secureTextEntry
                                                />
                                            </View>
                                        </View>

                                        <View style={s.seguridad}>
                                            <Text style={{ fontSize: 16 }}>🔒</Text>
                                            <Text style={s.seguridadText}>Transacción segura con encriptación SSL de 256 bits</Text>
                                        </View>

                                        <TouchableOpacity style={s.procederBtn} onPress={handleEnviarTarjeta}>
                                            <Text style={s.procederText}>PAGAR ${montoAPagar.toFixed(2)}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={s.backBtn} onPress={handleReset}>
                                            <Text style={s.backText}>← Cambiar método</Text>
                                        </TouchableOpacity>
                                    </>
                                )}

                                {/* ═══ MANTENIMIENTO (aparece al enviar formulario) ═══ */}
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
    card: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 520, maxHeight: '92%' },

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

    procederBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 10, marginTop: 8 },
    procederText: { color: Colors.black, fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },

    backBtn: { alignItems: 'center', paddingVertical: 10 },
    backText: { color: Colors.textMuted, fontSize: 14 },

    // ── Formularios ──
    formLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 14 },
    formInput: {
        backgroundColor: '#1e1e1e', color: Colors.text, padding: 14, borderRadius: 10,
        borderWidth: 1, borderColor: Colors.border, fontSize: 14,
    },

    cuentaOption: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
        borderRadius: 10, padding: 12, marginBottom: 8,
    },
    cuentaOptionActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,193,7,0.08)' },
    radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border },
    radioActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
    cuentaBanco: { color: Colors.text, fontSize: 14, fontWeight: '700' },
    cuentaNum: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
    cuentaTitular: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },

    toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
    toggleBtn: {
        flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10,
        borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background,
    },
    toggleBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,193,7,0.15)' },
    toggleText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
    toggleTextActive: { color: Colors.primary },

    seguridad: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, marginBottom: 4, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(25,135,84,0.1)', borderRadius: 8 },
    seguridadText: { color: Colors.success, fontSize: 12 },

    // ── Mantenimiento ──
    mantenimiento: { alignItems: 'center', paddingVertical: 20 },
    mantenimientoIcon: { fontSize: 64, marginBottom: 16 },
    mantenimientoTitle: { color: Colors.warning, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
    mantenimientoDesc: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    mantenimientoBtn: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
    mantenimientoBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },

    cancelBtn: { marginTop: 12, paddingVertical: 14, alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#444' },
    cancelText: { color: Colors.textMuted, fontWeight: '600', fontSize: 14 },
});
