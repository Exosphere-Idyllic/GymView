// app/(auth)/registro.tsx
// Conversión exacta de LoginRegistro.html de MathewLara
// Paso 1: Formulario de datos  →  Paso 2: Verificación de código por email

import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, KeyboardAvoidingView,
    Platform, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import authService from '../../src/services/auth.service';

type Step = 'datos' | 'verificacion';

interface FormData {
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    telefono: string;
    fechaNacimiento: string;
    usuario: string;
    contrasena: string;
}

interface FieldErrors {
    nombre?: string;
    apellido?: string;
    cedula?: string;
    email?: string;
    telefono?: string;
    fechaNacimiento?: string;
    usuario?: string;
    contrasena?: string;
    codigo?: string;
}

export default function RegistroScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    const [step, setStep] = useState<Step>('datos');
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [globalSuccess, setGlobalSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [displayEmail, setDisplayEmail] = useState('');
    const [codigoVerif, setCodigoVerif] = useState('');
    const [showPass, setShowPass] = useState(false);

    const [form, setForm] = useState<FormData>({
        nombre: '', apellido: '', cedula: '', email: '',
        telefono: '', fechaNacimiento: '', usuario: '', contrasena: '',
    });

    const setField = (key: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        // Limpiar error del campo al escribir
        if (fieldErrors[key]) {
            setFieldErrors(prev => ({ ...prev, [key]: undefined }));
        }
    };

    const clearErrors = () => {
        setGlobalError('');
        setGlobalSuccess('');
        setFieldErrors({});
    };

    // ── Paso 1: Registro ──────────────────────────────────────────────────────
    const handleRegistro = async () => {
        clearErrors();

        // Validación básica local
        const newErrors: FieldErrors = {};
        if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!form.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
        if (!form.cedula.trim() || form.cedula.length < 10) newErrors.cedula = 'Cédula inválida (10 dígitos)';
        if (!form.email.includes('@')) newErrors.email = 'Email inválido';
        if (!form.telefono.trim()) newErrors.telefono = 'Teléfono requerido';
        if (!form.usuario.trim()) newErrors.usuario = 'Usuario requerido';
        if (!form.contrasena || form.contrasena.length < 4) newErrors.contrasena = 'Mínimo 4 caracteres';

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            await authService.registro({
                nombre: form.nombre,
                apellido: form.apellido,
                cedula: form.cedula,
                telefono: form.telefono,
                email: form.email,
                fechaNacimiento: form.fechaNacimiento,
                usuario: form.usuario,
                contrasena: form.contrasena,
                idRol: 4,
            });

            setDisplayEmail(form.email);
            setGlobalSuccess('Código enviado. Revisa tu correo.');
            setStep('verificacion');

        } catch (e: any) {
            const msg: string = e.message || 'Error en el registro';
            const lower = msg.toLowerCase();

            const mapped: FieldErrors = {};
            if (lower.includes('cédula') || lower.includes('cedula')) mapped.cedula = msg;
            else if (lower.includes('nombre')) mapped.nombre = msg;
            else if (lower.includes('apellido')) mapped.apellido = msg;
            else if (lower.includes('correo') || lower.includes('email')) mapped.email = msg;
            else if (lower.includes('teléfono') || lower.includes('telefono')) mapped.telefono = msg;
            else if (lower.includes('usuario')) mapped.usuario = msg;
            else if (lower.includes('contraseña') || lower.includes('password')) mapped.contrasena = msg;

            if (Object.keys(mapped).length > 0) {
                setFieldErrors(mapped);
            } else {
                setGlobalError(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ── Paso 2: Verificación ─────────────────────────────────────────────────
    const handleVerificar = async () => {
        clearErrors();
        if (!codigoVerif || codigoVerif.length < 4) {
            setFieldErrors({ codigo: 'Código inválido' });
            return;
        }

        setIsLoading(true);
        try {
            await authService.verificarCuenta(displayEmail, codigoVerif);
            setGlobalSuccess('¡Cuenta verificada! Redirigiendo...');
            setTimeout(() => router.replace('/(auth)/login'), 1500);
        } catch (e: any) {
            setFieldErrors({ codigo: e.message || 'Código incorrecto' });
        } finally {
            setIsLoading(false);
        }
    };

    const cardStyle = [styles.card, isDesktop && styles.cardDesktop];

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]} keyboardShouldPersistTaps="handled">

                <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace('/')}>
                    <Text style={styles.backHomeText}>⬅ Volver al inicio</Text>
                </TouchableOpacity>

                {/* ── Logo ── */}
                <View style={styles.logoArea}>
                    <Text style={styles.logoIcon}>⚡</Text>
                    <Text style={styles.logoTitle}>Únete a Iron Fitness</Text>
                </View>

                {/* ── Mensaje global ── */}
                {!!globalError && (
                    <View style={styles.alertDanger}>
                        <Text style={styles.alertText}>⚠️ {globalError}</Text>
                    </View>
                )}
                {!!globalSuccess && (
                    <View style={styles.alertSuccess}>
                        <Text style={styles.alertText}>✅ {globalSuccess}</Text>
                    </View>
                )}

                <View style={cardStyle}>
                    {/* ════════════════════════════════
                        PASO 1 – DATOS PERSONALES
                    ════════════════════════════════ */}
                    {step === 'datos' && (
                        <>
                            <Text style={styles.cardSubtitle}>Empieza tu transformación hoy.</Text>

                            {/* Nombre + Apellido side by side en desktop */}
                            <View style={[styles.row2, isDesktop && styles.row2Desktop]}>
                                <View style={[styles.fieldWrap, isDesktop && { flex: 1, marginRight: 8 }]}>
                                    <Field label="Nombre" value={form.nombre} onChange={v => setField('nombre', v)}
                                           placeholder="Ej: Juan" error={fieldErrors.nombre} />
                                </View>
                                <View style={[styles.fieldWrap, isDesktop && { flex: 1, marginLeft: 8 }]}>
                                    <Field label="Apellido" value={form.apellido} onChange={v => setField('apellido', v)}
                                           placeholder="Ej: Pérez" error={fieldErrors.apellido} />
                                </View>
                            </View>

                            <Field label="Cédula de Identidad" value={form.cedula} onChange={v => setField('cedula', v)}
                                   placeholder="10 dígitos" keyboardType="numeric" error={fieldErrors.cedula} icon="🪪" />

                            <Field label="Correo Electrónico" value={form.email} onChange={v => setField('email', v)}
                                   placeholder="juan@email.com" keyboardType="email-address" error={fieldErrors.email} icon="✉️" />

                            <Field label="Teléfono Móvil" value={form.telefono} onChange={v => setField('telefono', v)}
                                   placeholder="Ej: 0991234567" keyboardType="phone-pad" error={fieldErrors.telefono} icon="📱" />

                            <Field label="Fecha de Nacimiento" value={form.fechaNacimiento} onChange={v => setField('fechaNacimiento', v)}
                                   placeholder="YYYY-MM-DD" error={fieldErrors.fechaNacimiento} icon="📅" />

                            <Field label="Usuario" value={form.usuario} onChange={v => setField('usuario', v)}
                                   placeholder="Nombre de usuario" error={fieldErrors.usuario} icon="👤" />

                            {/* Contraseña con toggle */}
                            <View style={styles.fieldWrap}>
                                <Text style={styles.label}>Contraseña</Text>
                                <View style={[styles.inputRow, fieldErrors.contrasena ? styles.inputError : null]}>
                                    <Text style={styles.inputIcon}>🔒</Text>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Ingresa tu contraseña"
                                        placeholderTextColor="#666"
                                        value={form.contrasena}
                                        onChangeText={v => setField('contrasena', v)}
                                        secureTextEntry={!showPass}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                                        <Text>{showPass ? '🙈' : '👁'}</Text>
                                    </TouchableOpacity>
                                </View>
                                {!!fieldErrors.contrasena && <Text style={styles.errorText}>{fieldErrors.contrasena}</Text>}
                            </View>

                            <TouchableOpacity
                                style={[styles.btnBrand, isLoading && styles.btnDisabled]}
                                onPress={handleRegistro}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? <ActivityIndicator color={Colors.black} />
                                    : <Text style={styles.btnBrandText}>REGISTRARME</Text>
                                }
                            </TouchableOpacity>

                            <View style={styles.loginLink}>
                                <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
                                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                                    <Text style={styles.loginLinkAction}>Inicia sesión</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {/* ════════════════════════════════
                        PASO 2 – VERIFICACIÓN DE EMAIL
                    ════════════════════════════════ */}
                    {step === 'verificacion' && (
                        <>
                            <View style={styles.verifyHeader}>
                                <Text style={styles.verifyIcon}>✉️</Text>
                                <Text style={styles.verifyTitle}>Verifica tu correo</Text>
                                <Text style={styles.verifySubtitle}>
                                    Hemos enviado un código a:{'\n'}
                                    <Text style={styles.verifyEmail}>{displayEmail}</Text>
                                </Text>
                            </View>

                            <View style={styles.fieldWrap}>
                                <TextInput
                                    style={[styles.codeInput, fieldErrors.codigo ? styles.inputError : null]}
                                    placeholder="######"
                                    placeholderTextColor="#666"
                                    value={codigoVerif}
                                    onChangeText={setCodigoVerif}
                                    keyboardType="numeric"
                                    maxLength={8}
                                />
                                {!!fieldErrors.codigo && (
                                    <Text style={[styles.errorText, { textAlign: 'center' }]}>{fieldErrors.codigo}</Text>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.btnBrand, isLoading && styles.btnDisabled]}
                                onPress={handleVerificar}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? <ActivityIndicator color={Colors.black} />
                                    : <Text style={styles.btnBrandText}>VERIFICAR CUENTA</Text>
                                }
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('datos'); clearErrors(); }}>
                                <Text style={styles.backBtnText}>Corregir correo</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ── Componente campo reutilizable ─────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, error, icon, keyboardType, secure }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; error?: string; icon?: string;
    keyboardType?: any; secure?: boolean;
}) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputRow, error ? styles.inputError : null]}>
                {icon && <Text style={styles.inputIcon}>{icon}</Text>}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#666"
                    value={value}
                    onChangeText={onChange}
                    keyboardType={keyboardType || 'default'}
                    secureTextEntry={secure}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper:        { flex: 1, backgroundColor: Colors.background },
    scroll:         { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 },
    scrollDesktop:  { alignItems: 'center' },
    
    backHomeBtn:    { alignSelf: 'flex-start', marginBottom: 12 },
    backHomeText:   { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },

    logoArea:       { alignItems: 'center', marginBottom: 20 },
    logoIcon:       { fontSize: 48, marginBottom: 6 },
    logoTitle:      { fontSize: 22, fontWeight: 'bold', color: Colors.primary, textAlign: 'center', letterSpacing: 1 },

    alertDanger:    { backgroundColor: '#3d1a1a', borderWidth: 1, borderColor: Colors.danger, borderRadius: 8, padding: 12, marginBottom: 14 },
    alertSuccess:   { backgroundColor: '#1a3d2b', borderWidth: 1, borderColor: Colors.success, borderRadius: 8, padding: 12, marginBottom: 14 },
    alertText:      { color: Colors.text, fontSize: 13, textAlign: 'center' },

    card:           { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, alignSelf: 'center' },
    cardDesktop:    {  },
    cardSubtitle:   { color: Colors.textMuted, textAlign: 'center', marginBottom: 20, fontSize: 14 },

    row2:           { },
    row2Desktop:    { flexDirection: 'row' },

    fieldWrap:      { marginBottom: 16 },
    label:          { color: '#aaa', fontSize: 13, marginBottom: 6, fontWeight: '500' },
    inputRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, paddingHorizontal: 12 },
    inputError:     { borderColor: Colors.danger },
    inputIcon:      { fontSize: 15, marginRight: 8 },
    input:          { flex: 1, color: Colors.text, paddingVertical: 13, fontSize: 14 },
    eyeBtn:         { padding: 8 },
    errorText:      { color: Colors.danger, fontSize: 12, marginTop: 4 },

    btnBrand:       { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    btnDisabled:    { backgroundColor: '#555' },
    btnBrandText:   { color: Colors.black, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

    loginLink:      { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
    loginLinkText:  { color: Colors.textMuted, fontSize: 14 },
    loginLinkAction:{ color: Colors.primary, fontWeight: 'bold', fontSize: 14 },

    // Verificación
    verifyHeader:   { alignItems: 'center', marginBottom: 20 },
    verifyIcon:     { fontSize: 56, marginBottom: 12 },
    verifyTitle:    { color: Colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    verifySubtitle: { color: Colors.textMuted, textAlign: 'center', fontSize: 14, lineHeight: 22 },
    verifyEmail:    { color: Colors.text, fontWeight: 'bold' },
    codeInput:      { backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 16, color: Colors.text, fontSize: 28, fontWeight: 'bold', textAlign: 'center', letterSpacing: 10 },
    backBtn:        { alignItems: 'center', marginTop: 14 },
    backBtnText:    { color: Colors.textMuted, fontSize: 13 },
});