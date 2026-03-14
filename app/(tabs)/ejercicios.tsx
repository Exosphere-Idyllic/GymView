// app/(tabs)/ejercicios.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Platform, SafeAreaView
} from 'react-native';
import { useAuth } from '../../src/store/AuthContext';
import Colors from '../../src/theme/colors';
import rutinasService, { Ejercicio } from '../../src/services/rutinas.service';
import { useRouter } from 'expo-router';

export default function EjerciciosScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEjercicio, setEditingEjercicio] = useState<Ejercicio | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', grupoMuscular: '' });

  const cargarEjercicios = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rutinasService.getEjercicios();
      setEjercicios(data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudieron cargar los ejercicios.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch for roles that make sense, usually Admin or Trainer
    if (user?.rol === 'admin' || user?.rol === 'entrenador') {
      cargarEjercicios();
    }
  }, [user, cargarEjercicios]);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarEjercicios();
  };

  const abrirModalNuevo = () => {
    setEditingEjercicio(null);
    setForm({ nombre: '', grupoMuscular: '' });
    setModalVisible(true);
  };

  const abrirModalEditar = (ej: Ejercicio) => {
    setEditingEjercicio(ej);
    setForm({ nombre: ej.nombre, grupoMuscular: ej.grupoMuscular });
    setModalVisible(true);
  };

  const guardarEjercicio = async () => {
    if (!form.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      if (editingEjercicio && editingEjercicio.idEjercicio) {
        await rutinasService.updateEjercicio(editingEjercicio.idEjercicio, form.nombre, form.grupoMuscular);
      } else {
        await rutinasService.crearEjercicio(form.nombre, form.grupoMuscular);
      }
      setModalVisible(false);
      cargarEjercicios();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el ejercicio');
    } finally {
      setSaving(false);
    }
  };

  const eliminarEjercicio = (ej: Ejercicio) => {
    const execEliminar = async () => {
      try {
        await rutinasService.deleteEjercicio(ej.idEjercicio);
        cargarEjercicios();
      } catch (e: any) {
        Alert.alert('Violación de restricción', e.message || 'El ejercicio no puede ser borrado ya que probablemente esté en uso dentro de una rutina.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`¿Seguro que deseas eliminar el ejercicio "${ej.nombre}"?`)) {
        execEliminar();
      }
    } else {
      Alert.alert('Eliminar Ejercicio', `¿Deseas borrar "${ej.nombre}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: execEliminar }
      ]);
    }
  };

  // Restrict access
  if (user?.rol !== 'admin' && user?.rol !== 'entrenador') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.iconBig}>🏋️</Text>
        <Text style={styles.titleBig}>Consulta tus Rutinas</Text>
        <Text style={styles.subText}>
          Ve a la pestaña Inicio para ver tu plan actual y agenda del día.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Biblioteca de Ejercicios</Text>
        <TouchableOpacity style={styles.addBtn} onPress={abrirModalNuevo}>
          <Text style={styles.addBtnText}>+ Nuevo Ejercicio</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.container}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} />}
        >
          <View style={styles.listContainer}>
            {ejercicios.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={{ fontSize: 48 }}>🏋️‍♂️</Text>
                <Text style={styles.emptyText}>No hay ejercicios registrados.</Text>
              </View>
            ) : (
              ejercicios.map((ej) => (
                <View key={ej.idEjercicio} style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{ej.nombre}</Text>
                    <Text style={styles.cardRef}>{ej.grupoMuscular || 'General'}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => abrirModalEditar(ej)}>
                      <Text style={styles.actionBtnText}>✏️ Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF3B3020' }]} onPress={() => eliminarEjercicio(ej)}>
                      <Text style={styles.actionBtnText}>🗑️ Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Modal CRUD Ejercicio */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{editingEjercicio ? '✏️ Editar Ejercicio' : '➕ Nuevo Ejercicio'}</Text>

              <Text style={styles.label}>Nombre del Ejercicio *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Press de Banca"
                placeholderTextColor="#666"
                value={form.nombre}
                onChangeText={(v) => setForm((p) => ({ ...p, nombre: v }))}
              />

              <Text style={styles.label}>Grupo Muscular</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Pecho, Espalda, Piernas"
                placeholderTextColor="#666"
                value={form.grupoMuscular}
                onChangeText={(v) => setForm((p) => ({ ...p, grupoMuscular: v }))}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={guardarEjercicio} disabled={saving}>
                  {saving ? <ActivityIndicator color={Colors.black} /> : <Text style={styles.saveBtnText}>Guardar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: { color: Colors.text, fontSize: 22, fontWeight: 'bold' },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: Colors.black, fontWeight: 'bold' },

  container: { flex: 1, padding: 15 },
  listContainer: { paddingBottom: 40 },

  card: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardRef: { color: Colors.textMuted, fontSize: 14 },

  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#333' },
  actionBtnText: { color: Colors.text, fontSize: 13, fontWeight: '600' },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: Colors.textMuted, fontSize: 16, marginTop: 16 },

  centerContainer: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconBig: { fontSize: 64, marginBottom: 16 },
  titleBig: { color: Colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  subText: { color: Colors.textMuted, textAlign: 'center', fontSize: 15, lineHeight: 22 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { flexGrow: 1, justifyContent: 'center' },
  modalCard: { backgroundColor: Colors.surface, padding: 25, borderRadius: 16, width: '100%', maxWidth: 500, alignSelf: 'center', borderWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { color: Colors.textMuted, fontSize: 14, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#1e1e1e', borderWidth: 1, borderColor: Colors.border, color: Colors.text, padding: 14, borderRadius: 8, fontSize: 16 },

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 30, gap: 15 },
  cancelBtn: { padding: 14, borderRadius: 8, flex: 1, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  cancelBtnText: { color: Colors.text, fontWeight: '600', fontSize: 16 },
  saveBtn: { backgroundColor: Colors.primary, padding: 14, borderRadius: 8, flex: 1, alignItems: 'center' },
  saveBtnText: { color: Colors.black, fontWeight: 'bold', fontSize: 16 },
});
