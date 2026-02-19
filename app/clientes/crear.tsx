// app/clientes/crear.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';

export default function CrearCliente() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    fecha_nacimiento: '', usuario: '', contrasena: '', plan: 'Plan Smart',
  });

  const handleSave = () => {
    if (!form.nombre || !form.email) {
      Alert.alert('Campos requeridos', 'Nombre y email son obligatorios');
      return;
    }
    Alert.alert('✅ Guardado', 'Cliente registrado (en modo mock). Se enviará al API cuando esté disponible.', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const Field = ({ label, key, placeholder, keyboardType = 'default', secure = false }: any) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={(form as any)[key]}
        onChangeText={v => setForm(prev => ({ ...prev, [key]: v }))}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Cancelar</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Cliente</Text>
        <TouchableOpacity onPress={handleSave}><Text style={styles.saveBtn}>Guardar</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <Field label="Nombre *" key="nombre" placeholder="Ej: Juan" />
        <Field label="Apellido *" key="apellido" placeholder="Ej: Pérez" />
        <Field label="Email *" key="email" placeholder="juan@email.com" keyboardType="email-address" />
        <Field label="Teléfono" key="telefono" placeholder="0991234567" keyboardType="phone-pad" />
        <Field label="Fecha de Nacimiento" key="fecha_nacimiento" placeholder="YYYY-MM-DD" />

        <Text style={styles.sectionLabel}>Plan de Membresía</Text>
        <View style={styles.planRow}>
          {['Plan Smart ($24.99)', 'Plan Black ($34.99)'].map((p, i) => {
            const key = i === 0 ? 'Plan Smart' : 'Plan Black';
            return (
              <TouchableOpacity
                key={i}
                style={[styles.planBtn, form.plan === key && styles.planBtnActive]}
                onPress={() => setForm(prev => ({ ...prev, plan: key }))}
              >
                <Text style={[styles.planBtnText, form.plan === key && styles.planBtnTextActive]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Credenciales de Acceso</Text>
        <Field label="Usuario" key="usuario" placeholder="Nombre de usuario" />
        <Field label="Contraseña" key="contrasena" placeholder="Contraseña" secure={true} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
          <Text style={styles.submitText}>REGISTRAR CLIENTE</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { color: Colors.danger, fontSize: 15 },
  headerTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
  saveBtn: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  field: { marginBottom: 16 },
  label: { color: Colors.textMuted, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 14, color: Colors.text, fontSize: 15 },
  sectionLabel: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 10, marginTop: 8 },
  planRow: { flexDirection: 'row', gap: 10 },
  planBtn: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 14, alignItems: 'center' },
  planBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(255,193,7,0.1)' },
  planBtnText: { color: Colors.textMuted, fontSize: 13 },
  planBtnTextActive: { color: Colors.primary, fontWeight: '700' },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 20 },
  submitText: { color: Colors.black, fontWeight: '800', fontSize: 16 },
});
