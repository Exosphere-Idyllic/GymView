// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/store/AuthContext';
import Colors from '../../src/theme/colors';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!usuario.trim() || !contrasena.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa usuario y contraseña');
      return;
    }
    try {
      setIsLoading(true);
      await login({ usuario: usuario.trim(), contrasena });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Credenciales incorrectas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo / Header */}
        <View style={styles.header}>
          <Text style={styles.logoIcon}>⚡</Text>
          <Text style={styles.logoText}>IRON FITNESS</Text>
          <Text style={styles.subtitle}>Sistema de Gestión</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acceso al Sistema</Text>

          {/* Usuario */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Usuario</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu usuario"
                placeholderTextColor="#666"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#666"
                value={contrasena}
                onChangeText={setContrasena}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Text style={{ color: '#666' }}>{showPass ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botón */}
          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color={Colors.black} />
              : <Text style={styles.btnText}>INGRESAR</Text>
            }
          </TouchableOpacity>

          {/* Demo hint */}
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>👆 Usuarios de prueba</Text>
            <Text style={styles.demoText}>admin / 1234 → Administrador</Text>
            <Text style={styles.demoText}>recep / 1234 → Recepcionista</Text>
            <Text style={styles.demoText}>coach / 1234 → Entrenador</Text>
            <Text style={styles.demoText}>juan / 1234 → Cliente</Text>
          </View>
        </View>

        <Text style={styles.footer}>Iron Fitness © 2026 – Quito, Ecuador</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 56, marginBottom: 8 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, letterSpacing: 2 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: Colors.textMuted, textAlign: 'center', marginBottom: 24 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, color: '#aaa', marginBottom: 6, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, paddingHorizontal: 12,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: Colors.text, paddingVertical: 14, fontSize: 15 },
  eyeBtn: { padding: 8 },
  btn: {
    backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#555' },
  btnText: { color: Colors.black, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  demoBox: {
    marginTop: 20, padding: 12, backgroundColor: '#1a1a1a',
    borderRadius: 8, borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  demoTitle: { color: Colors.primary, fontWeight: '600', marginBottom: 6, fontSize: 13 },
  demoText: { color: '#888', fontSize: 12, marginBottom: 2 },
  footer: { textAlign: 'center', color: '#555', fontSize: 12, marginTop: 24 },
});
