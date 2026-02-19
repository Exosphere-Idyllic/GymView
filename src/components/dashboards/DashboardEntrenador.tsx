// src/components/dashboards/DashboardEntrenador.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal } from 'react-native';
import Colors from '../../theme/colors';
import { MOCK_CLIENTES, MOCK_RUTINAS, MOCK_ENTRENADORES } from '../../services/mock/mockData';
import { useAuth } from '../../store/AuthContext';
import { useRouter } from 'expo-router';

type Tab = 'tablero' | 'alumnos' | 'rutinas';

export default function DashboardEntrenador() {
  const [activeTab, setActiveTab] = useState<Tab>('tablero');
  const [selectedRutina, setSelectedRutina] = useState<typeof MOCK_RUTINAS[0] | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // El entrenador 1 es el que tiene id_usuario=3 que es 'coach'
  const entrenador = MOCK_ENTRENADORES[0];
  const misAlumnos = MOCK_CLIENTES.filter(c => c.id_entrenador === entrenador.id_entrenador);
  const misRutinas = MOCK_RUTINAS.filter(r => r.id_entrenador === entrenador.id_entrenador);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'tablero', label: 'Tablero', icon: '📊' },
    { key: 'alumnos', label: 'Alumnos', icon: '👥' },
    { key: 'rutinas', label: 'Rutinas', icon: '📋' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚡ IRON COACH</Text>
          <Text style={styles.headerSub}>{entrenador.nombre} {entrenador.apellido} · {entrenador.especialidad}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(auth)/login'); }}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsBar} contentContainerStyle={{ paddingHorizontal: 10 }}>
        {tabs.map(t => (
          <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.tabActive]} onPress={() => setActiveTab(t.key)}>
            <Text>{t.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* TABLERO */}
        {activeTab === 'tablero' && (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderLeftColor: '#1565C0' }]}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={[styles.statVal, { color: '#42A5F5' }]}>{entrenador.totalAlumnos}</Text>
                <Text style={styles.statLabel}>Alumnos Activos</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
                <Text style={styles.statIcon}>📋</Text>
                <Text style={[styles.statVal, { color: Colors.primary }]}>{entrenador.rutinasCreadas}</Text>
                <Text style={styles.statLabel}>Rutinas Creadas</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>🔥 Últimas Rutinas</Text>
            {misRutinas.slice(0, 3).map(r => {
              const cliente = MOCK_CLIENTES.find(c => c.id_cliente === r.id_cliente);
              return (
                <TouchableOpacity key={r.id_rutina} style={styles.rutinaCard} onPress={() => setSelectedRutina(r)}>
                  <Text style={styles.rutinaName}>{r.nombre_rutina}</Text>
                  <Text style={styles.rutinaSub}>👤 {cliente?.nombre} {cliente?.apellido} · {r.ejercicios.length} ejercicios</Text>
                </TouchableOpacity>
              );
            })}

            <Text style={styles.sectionTitle}>Estado de Alumnos (Hoy)</Text>
            {misAlumnos.map(al => (
              <View key={al.id_cliente} style={styles.alumnoRow}>
                <View style={[styles.avatar, { backgroundColor: '#1565C0' }]}>
                  <Text style={styles.avatarText}>{al.nombre[0]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.alumnoName}>{al.nombre} {al.apellido}</Text>
                  <Text style={styles.alumnoSub}>{al.nombrePlan}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: al.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                  <Text style={styles.badgeText}>{al.estadoMembresia}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ALUMNOS */}
        {activeTab === 'alumnos' && (
          <>
            <Text style={styles.sectionTitle}>Mis Alumnos ({misAlumnos.length})</Text>
            {misAlumnos.map(al => (
              <View key={al.id_cliente} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.avatar, { backgroundColor: '#1565C0' }]}>
                    <Text style={styles.avatarText}>{al.nombre[0]}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.alumnoName}>{al.nombre} {al.apellido}</Text>
                    <Text style={styles.alumnoSub}>{al.email}</Text>
                    <Text style={styles.alumnoSub}>📞 {al.telefono}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>📋 {al.nombrePlan}</Text>
                  <View style={[styles.badge, { backgroundColor: al.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                    <Text style={styles.badgeText}>{al.estadoMembresia}</Text>
                  </View>
                </View>

                {/* Rutinas del alumno */}
                {misRutinas.filter(r => r.id_cliente === al.id_cliente).map(r => (
                  <TouchableOpacity key={r.id_rutina} style={styles.rutinaChip} onPress={() => setSelectedRutina(r)}>
                    <Text style={styles.rutinaChipText}>🏋️ {r.nombre_rutina} ({r.ejercicios.length} ej.)</Text>
                    <Text style={{ color: Colors.primary }}>Ver →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}

        {/* RUTINAS */}
        {activeTab === 'rutinas' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Biblioteca de Rutinas</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Nueva Rutina', 'Se conectará al API')}>
                <Text style={styles.addBtnText}>+ Nueva</Text>
              </TouchableOpacity>
            </View>
            {misRutinas.map(r => {
              const cliente = MOCK_CLIENTES.find(c => c.id_cliente === r.id_cliente);
              return (
                <View key={r.id_rutina} style={styles.card}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alumnoName}>{r.nombre_rutina}</Text>
                      <Text style={styles.alumnoSub}>👤 {cliente?.nombre} {cliente?.apellido}</Text>
                      <Text style={styles.alumnoSub}>🎯 {r.objetivo}</Text>
                      <Text style={styles.alumnoSub}>📅 {r.fecha_creacion}</Text>
                    </View>
                    <View style={styles.exBadge}><Text style={styles.exBadgeText}>{r.ejercicios.length}</Text><Text style={{ color: Colors.textMuted, fontSize: 10 }}>ej.</Text></View>
                  </View>
                  <View style={styles.cardFooter}>
                    <TouchableOpacity onPress={() => setSelectedRutina(r)}>
                      <Text style={{ color: Colors.info, fontSize: 13, fontWeight: '600' }}>👁 Ver detalle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('Editar', 'Se conectará al API')}>
                      <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>✏️ Editar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Modal detalle rutina */}
      <Modal visible={!!selectedRutina} animationType="slide" onRequestClose={() => setSelectedRutina(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedRutina(null)}>
              <Text style={{ color: Colors.primary, fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedRutina?.nombre_rutina}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={{ padding: 16 }}>
            <Text style={styles.alumnoSub}>🎯 {selectedRutina?.objetivo}</Text>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Ejercicios</Text>
            {selectedRutina?.ejercicios.map((e, i) => (
              <View key={i} style={[styles.card, { marginBottom: 8 }]}>
                <Text style={[styles.alumnoName, { color: Colors.primary }]}>{e.nombre_ejercicio}</Text>
                <Text style={styles.alumnoSub}>💪 {e.grupo_muscular}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.footerText}>Series: {e.series}</Text>
                  <Text style={styles.footerText}>Reps: {e.repeticiones}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { color: Colors.primary, fontWeight: 'bold', fontSize: 18 },
  headerSub: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderColor: Colors.danger, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  logoutText: { color: Colors.danger, fontSize: 13 },
  tabsBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 60 },
  tab: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  tabLabelActive: { color: Colors.primary, fontWeight: '600' },
  content: { flex: 1, padding: 14 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderLeftWidth: 4, borderRadius: 10, padding: 14 },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statVal: { fontSize: 26, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  addBtnText: { color: Colors.black, fontWeight: '700', fontSize: 13 },
  rutinaCard: { backgroundColor: '#1a1a1a', borderLeftWidth: 4, borderLeftColor: Colors.primary, borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rutinaName: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  rutinaSub: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  alumnoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.black, fontWeight: 'bold', fontSize: 16 },
  alumnoName: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  alumnoSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  footerText: { color: Colors.textMuted, fontSize: 12 },
  exBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  exBadgeText: { color: Colors.primary, fontWeight: 'bold', fontSize: 18 },
  rutinaChip: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 10, marginTop: 8 },
  rutinaChipText: { color: Colors.textMuted, fontSize: 13 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'center' },
});
