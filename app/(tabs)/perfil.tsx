// app/(tabs)/perfil.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../../src/store/AuthContext';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';

const ROL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  recepcionista: 'Recepcionista',
  entrenador: 'Entrenador',
  cliente: 'Cliente',
};

const ROL_ICONS: Record<string, string> = {
  admin: '🛡️',
  recepcionista: '🗂️',
  entrenador: '💪',
  cliente: '🏃',
};

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.nombre_completo?.substring(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.nombre}>{user?.nombre_completo}</Text>
          <View style={styles.rolBadge}>
            <Text style={styles.rolIcon}>{ROL_ICONS[user?.rol || 'cliente']}</Text>
            <Text style={styles.rolText}>{ROL_LABELS[user?.rol || 'cliente']}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de Cuenta</Text>
          {[
            { label: 'Usuario', val: user?.usuario },
            { label: 'Rol', val: ROL_LABELS[user?.rol || ''] },
            { label: 'ID Usuario', val: String(user?.id_usuario) },
          ].map((d, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rowLabel}>{d.label}</Text>
              <Text style={styles.rowVal}>{d.val}</Text>
            </View>
          ))}
        </View>

        {/* Módulos disponibles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Módulos Disponibles</Text>
          {user?.rol === 'admin' && ['Panel de Control', 'Clientes', 'Entrenadores', 'Pagos', 'Reportes', 'Logs de Acceso'].map((m, i) => (
            <Text key={i} style={styles.modulo}>✅ {m}</Text>
          ))}
          {user?.rol === 'recepcionista' && ['Control Acceso QR', 'Gestión Socios', 'Caja / Pagos', 'Horarios'].map((m, i) => (
            <Text key={i} style={styles.modulo}>✅ {m}</Text>
          ))}
          {user?.rol === 'entrenador' && ['Mi Tablero', 'Mis Alumnos', 'Biblioteca de Rutinas', 'Mi Agenda'].map((m, i) => (
            <Text key={i} style={styles.modulo}>✅ {m}</Text>
          ))}
          {user?.rol === 'cliente' && ['Mi QR de Acceso', 'Mi Entrenamiento', 'Estado de Membresía'].map((m, i) => (
            <Text key={i} style={styles.modulo}>✅ {m}</Text>
          ))}
        </View>

        {/* API Status */}
        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: Colors.warning }]}>
          <Text style={styles.cardTitle}>⚠️ Estado del Sistema</Text>
          <Text style={styles.apiStatus}>Modo: <Text style={{ color: Colors.warning }}>MOCK / Sin API</Text></Text>
          <Text style={styles.apiNote}>Todos los datos son de prueba. Cuando el backend esté disponible, conecta la URL en src/config/api.config.ts</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 20 },
  content: { flex: 1, padding: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: Colors.black, fontWeight: 'bold', fontSize: 28 },
  nombre: { color: Colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  rolBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, gap: 6 },
  rolIcon: { fontSize: 16 },
  rolText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, marginBottom: 14 },
  cardTitle: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { color: Colors.textMuted, fontSize: 14 },
  rowVal: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  modulo: { color: Colors.textMuted, fontSize: 14, paddingVertical: 4 },
  apiStatus: { color: Colors.text, fontSize: 14, marginBottom: 6 },
  apiNote: { color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
  logoutBtn: { backgroundColor: Colors.danger, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
});
