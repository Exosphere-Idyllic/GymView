// app/(tabs)/perfil.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert,
  Modal, TextInput, ActivityIndicator, Platform,
} from 'react-native';
import { useAuth } from '../../src/store/AuthContext';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import usuariosService from '../../src/services/usuarios.service';

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
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editContrasena, setEditContrasena] = useState('');
  const [saving, setSaving] = useState(false);

  const abrirEditar = () => {
    const parts = (user?.nombre_completo || '').trim().split(/\s+/);
    setEditNombre(parts[0] || '');
    setEditApellido(parts.slice(1).join(' ') || '');
    setEditContrasena('');
    setModalVisible(true);
  };

  const guardarPerfil = async () => {
    if (!user?.id_usuario) return;
    const nombre = editNombre.trim();
    const apellido = editApellido.trim();
    if (!nombre) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    setSaving(true);
    try {
      await usuariosService.actualizar(user.id_usuario, {
        nombre: nombre || undefined,
        apellido: apellido || undefined,
        contrasena: editContrasena.trim() || undefined,
      });
      updateUser({ nombre_completo: [nombre, apellido].filter(Boolean).join(' ') });
      setModalVisible(false);
      Alert.alert('✅ Listo', 'Datos actualizados correctamente');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // En web, Alert.alert no lanza el callback de los botones
      const confirmado = window.confirm('¿Estás seguro que deseas cerrar sesión?');
      if (!confirmado) return;
      await logout();
      router.replace('/(auth)/login');
    } else {
      Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas salir?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40, alignItems: 'center' }}>
        <View style={styles.pageInner}>
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



        {/* Editar perfil (solo si estamos conectados al API) */}
        {!user?.usandoMock && (
          <TouchableOpacity style={[styles.card, styles.editarBtn]} onPress={abrirEditar}>
            <Text style={styles.editarBtnText}>✏️ Editar mi perfil</Text>
            <Text style={styles.apiNote}>Nombre, apellido y contraseña</Text>
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Editar perfil */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar perfil</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                placeholderTextColor="#666"
                value={editNombre}
                onChangeText={setEditNombre}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput
                style={styles.input}
                placeholder="Apellido"
                placeholderTextColor="#666"
                value={editApellido}
                onChangeText={setEditApellido}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Nueva contraseña (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Dejar vacío para no cambiar"
                placeholderTextColor="#666"
                value={editContrasena}
                onChangeText={setEditContrasena}
                secureTextEntry
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={guardarPerfil} disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.black} size="small" /> : <Text style={styles.saveBtnText}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 20 },
  content: { flex: 1 },
  pageInner: { width: '100%', maxWidth: 1100, paddingHorizontal: 16, paddingTop: 16 },
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
  editarBtn: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  editarBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 15, marginBottom: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 620 },
  modalTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 18, marginBottom: 16, textAlign: 'center' },
  field: { marginBottom: 14 },
  label: { color: Colors.textMuted, fontSize: 13, marginBottom: 6 },
  input: { backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 12, color: Colors.text, fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: '#555', borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelBtnText: { color: Colors.textMuted, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
  saveBtnText: { color: Colors.black, fontWeight: '700', fontSize: 15 },
});
