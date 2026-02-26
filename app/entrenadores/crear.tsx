// app/entrenadores/crear.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import { useAuth } from '../../src/store/AuthContext';
import authService from '../../src/services/auth.service';

export default function CrearEntrenador() {
    const router = useRouter();
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        email: '',
        especialidad: '',
        usuario: '',
        contrasena: '',
    });

    const handleSave = async () => {
        if (!form.nombre || !form.apellido || !form.usuario) {
            Alert.alert('Campos requeridos', 'Nombre, apellido y usuario son obligatorios');
            return;
        }
        if (!form.contrasena || form.contrasena.length < 4) {
            Alert.alert('Contraseña', 'Mínimo 4 caracteres');
            return;
        }

        const esAdmin = user?.rol === 'admin';
        if (esAdmin) {
            setSaving(true);
            try {
                await authService.crearUsuarioAdmin({
                    idRol: 3,
                    usuario: form.usuario.trim(),
                    contrasena: form.contrasena,
                    nombre: form.nombre.trim(),
                    apellido: form.apellido.trim(),
                });
                Alert.alert('✅ Entrenador creado', 'El usuario fue registrado correctamente. La especialidad se puede configurar en su perfil.', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } catch (e: any) {
                Alert.alert('Error', e.message || 'No se pudo crear el entrenador');
            } finally {
                setSaving(false);
            }
        } else {
            Alert.alert(
                'Sin permiso',
                'Solo un administrador puede crear entrenadores desde aquí.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }
    };

    const Field = ({ label, key, placeholder, keyboardType = 'default', secure = false, multiline = false }: any) => (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
                placeholder={placeholder}
                placeholderTextColor="#666"
                value={(form as any)[key]}
                onChangeText={v => setForm(prev => ({ ...prev, [key]: v }))}
                keyboardType={keyboardType}
                secureTextEntry={secure}
                autoCapitalize="none"
                multiline={multiline}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.back}>← Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nuevo Entrenador</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.saveBtn}>Guardar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.sectionLabel}>Información Personal</Text>
                <Field label="Nombre *" key="nombre" placeholder="Ej: Carlos" />
                <Field label="Apellido *" key="apellido" placeholder="Ej: Mendoza" />
                <Field label="Email *" key="email" placeholder="carlos@ironfitness.com" keyboardType="email-address" />

                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Especialización</Text>
                <View style={styles.field}>
                    <Text style={styles.label}>Especialidad</Text>
                    <View style={styles.chipContainer}>
                        {['Musculación y Fuerza', 'Cardio y HIIT', 'Funcional', 'CrossFit', 'Yoga'].map((esp, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[
                                    styles.chipBtn,
                                    form.especialidad === esp && styles.chipBtnActive
                                ]}
                                onPress={() => setForm(prev => ({ ...prev, especialidad: esp }))}
                            >
                                <Text style={[
                                    styles.chipBtnText,
                                    form.especialidad === esp && styles.chipBtnTextActive
                                ]}>
                                    {esp}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Credenciales de Acceso</Text>
                <Field label="Usuario" key="usuario" placeholder="Nombre de usuario" />
                <Field label="Contraseña" key="contrasena" placeholder="Contraseña" secure={true} />

                <TouchableOpacity style={[styles.submitBtn, saving && styles.submitBtnDisabled]} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.submitText}>REGISTRAR ENTRENADOR</Text>}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>ℹ️ Información</Text>
                    <Text style={styles.infoText}>
                        • El entrenador tendrá acceso al panel de rutinas{'\n'}
                        • Podrá crear y asignar entrenamientos{'\n'}
                        • Verá el progreso de sus alumnos
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    back: { color: Colors.danger, fontSize: 15 },
    headerTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
    saveBtn: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
    sectionLabel: {
        color: Colors.text,
        fontWeight: '700',
        fontSize: 15,
        marginBottom: 10,
        marginTop: 8
    },
    field: { marginBottom: 16 },
    label: { color: Colors.textMuted, fontSize: 13, marginBottom: 6 },
    input: {
        backgroundColor: '#2c2c2c',
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 10,
        padding: 14,
        color: Colors.text,
        fontSize: 15
    },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipBtn: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12
    },
    chipBtnActive: {
        borderColor: Colors.primary,
        backgroundColor: 'rgba(255,193,7,0.1)'
    },
    chipBtnText: { color: Colors.textMuted, fontSize: 12 },
    chipBtnTextActive: { color: Colors.primary, fontWeight: '700' },
    submitBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 20
    },
    submitBtnDisabled: { backgroundColor: '#555', opacity: 0.8 },
    submitText: { color: Colors.black, fontWeight: '800', fontSize: 16 },
    infoBox: {
        backgroundColor: 'rgba(255,193,7,0.1)',
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
        borderRadius: 8,
        padding: 12,
        marginTop: 20
    },
    infoTitle: { color: Colors.primary, fontWeight: '700', fontSize: 13, marginBottom: 6 },
    infoText: { color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
});