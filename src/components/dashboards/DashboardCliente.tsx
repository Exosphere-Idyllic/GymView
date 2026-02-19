// src/components/dashboards/DashboardCliente.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import Colors from '../../theme/colors';
import { MOCK_CLIENTES, MOCK_RUTINAS, MOCK_ASISTENCIAS } from '../../services/mock/mockData';
import { useAuth } from '../../store/AuthContext';
import { useRouter } from 'expo-router';

type Tab = 'inicio' | 'rutina' | 'membresia';

export default function DashboardCliente() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [ejerciciosCompletados, setEjerciciosCompletados] = useState<number[]>([]);
  const { user, logout } = useAuth();
  const router = useRouter();

  // El cliente es el usuario "juan" -> id_usuario=4 -> id_cliente=1
  const cliente = MOCK_CLIENTES[0];
  const rutinaActiva = MOCK_RUTINAS.find(r => r.id_cliente === cliente.id_cliente && r.activa);
  const misAsistencias = MOCK_ASISTENCIAS.filter(a => a.id_cliente === cliente.id_cliente).slice(0, 4);

  const toggleEjercicio = (idx: number) => {
    setEjerciciosCompletados(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'inicio', label: 'Inicio', icon: '🏠' },
    { key: 'rutina', label: 'Entrenamiento', icon: '🏋️' },
    { key: 'membresia', label: 'Membresía', icon: '💳' },
  ];

  const membresiaActiva = cliente.estadoMembresia === 'Activa';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚡ IRON MEMBER</Text>
          <Text style={styles.headerSub}>Hola, {cliente.nombre} {cliente.apellido}</Text>
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
        {/* ─── INICIO ─── */}
        {activeTab === 'inicio' && (
          <>
            {/* QR Pase */}
            <View style={styles.qrCard}>
              <Text style={styles.qrTitle}>🎫 Pase de Acceso</Text>
              <View style={styles.qrBox}>
                {/* Simulación visual de QR */}
                <View style={styles.qrSimulated}>
                  <Text style={{ fontSize: 60 }}>▣</Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 4 }}>IRON_{cliente.id_cliente}</Text>
                </View>
              </View>
              <Text style={styles.qrId}>ID Cliente: <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{cliente.id_cliente}</Text></Text>
            </View>

            {/* Datos */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Mis Datos</Text>
              {[
                { label: 'Nombre', val: `${cliente.nombre} ${cliente.apellido}` },
                { label: 'Email', val: cliente.email },
                { label: 'Teléfono', val: cliente.telefono },
              ].map((d, i) => (
                <View key={i} style={styles.dataRow}>
                  <Text style={styles.dataLabel}>{d.label}</Text>
                  <Text style={styles.dataVal}>{d.val}</Text>
                </View>
              ))}
            </View>

            {/* Últimas asistencias */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Últimas Asistencias</Text>
              {misAsistencias.length === 0
                ? <Text style={styles.empty}>Sin registros aún</Text>
                : misAsistencias.map(a => (
                  <View key={a.id_asistencia} style={styles.asistenciaRow}>
                    <Text style={{ fontSize: 20 }}>{a.fecha_hora_salida ? '✅' : '🏃'}</Text>
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.asistenciaDate}>{new Date(a.fecha_hora_ingreso).toLocaleDateString('es', { weekday: 'long', day: '2-digit', month: 'short' })}</Text>
                      <Text style={styles.asistenciaTime}>
                        Entrada: {new Date(a.fecha_hora_ingreso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        {a.fecha_hora_salida ? ` · Salida: ${new Date(a.fecha_hora_salida).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}` : ' · En gimnasio'}
                      </Text>
                    </View>
                  </View>
                ))
              }
            </View>
          </>
        )}

        {/* ─── RUTINA ─── */}
        {activeTab === 'rutina' && (
          <>
            {!rutinaActiva
              ? <View style={styles.emptyCard}><Text style={styles.empty}>No tienes rutina asignada por tu entrenador.</Text></View>
              : (
                <>
                  <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: Colors.primary }]}>
                    <Text style={styles.sectionTitle}>{rutinaActiva.nombre_rutina}</Text>
                    <Text style={styles.dataLabel}>🎯 {rutinaActiva.objetivo}</Text>
                    <Text style={[styles.dataLabel, { marginTop: 4 }]}>
                      Progreso: {ejerciciosCompletados.length}/{rutinaActiva.ejercicios.length}
                    </Text>
                    {/* Barra de progreso */}
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${(ejerciciosCompletados.length / rutinaActiva.ejercicios.length) * 100}%` as any }]} />
                    </View>
                  </View>

                  {rutinaActiva.ejercicios.map((e, i) => {
                    const done = ejerciciosCompletados.includes(i);
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.ejercicioCard, done && styles.ejercicioDone]}
                        onPress={() => toggleEjercicio(i)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.ejercicioName, done && styles.ejercicioDoneText]}>{e.nombre_ejercicio}</Text>
                          <Text style={styles.ejercicioMuscle}>💪 {e.grupo_muscular}</Text>
                        </View>
                        <View style={styles.ejercicioStats}>
                          <Text style={styles.ejercicioStat}>{e.series} series</Text>
                          <Text style={styles.ejercicioStat}>{e.repeticiones} reps</Text>
                        </View>
                        <View style={[styles.checkbox, done && styles.checkboxDone]}>
                          {done && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={[styles.finBtn, ejerciciosCompletados.length === rutinaActiva.ejercicios.length && styles.finBtnReady]}
                    onPress={() => Alert.alert('¡Excelente!', '¡Entrenamiento completado! Se notificará a tu entrenador cuando el API esté disponible.')}
                  >
                    <Text style={styles.finBtnText}>
                      {ejerciciosCompletados.length === rutinaActiva.ejercicios.length ? '🏆 TERMINAR ENTRENAMIENTO' : `⏳ ${rutinaActiva.ejercicios.length - ejerciciosCompletados.length} ejercicios pendientes`}
                    </Text>
                  </TouchableOpacity>
                </>
              )
            }
          </>
        )}

        {/* ─── MEMBRESÍA ─── */}
        {activeTab === 'membresia' && (
          <View style={{ alignItems: 'center' }}>
            <View style={styles.membresiaCard}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>{membresiaActiva ? '🛡️' : '❌'}</Text>
              <Text style={styles.membresiaTitle}>{cliente.nombrePlan}</Text>
              <View style={[styles.badge, { backgroundColor: membresiaActiva ? Colors.success : Colors.danger, alignSelf: 'center', marginVertical: 10, paddingVertical: 6, paddingHorizontal: 16 }]}>
                <Text style={[styles.badgeText, { fontSize: 14 }]}>{membresiaActiva ? 'ACTIVA' : 'VENCIDA'}</Text>
              </View>

              <View style={styles.membresiaInfo}>
                <View style={styles.membresiaInfoItem}>
                  <Text style={styles.dataLabel}>Fecha de Vencimiento</Text>
                  <Text style={styles.membresiaVal}>{cliente.fecha_vencimiento}</Text>
                </View>
                <View style={styles.membresiaInfoItem}>
                  <Text style={styles.dataLabel}>Costo Mensual</Text>
                  <Text style={[styles.membresiaVal, { color: Colors.primary }]}>
                    ${cliente.nombrePlan === 'Plan Black' ? '34.99' : '24.99'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.renovarBtn}
                onPress={() => Alert.alert('Renovar Plan', 'Se integrará con pasarela de pagos cuando el API esté disponible.')}
              >
                <Text style={styles.renovarText}>💳 Renovar Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle: { color: Colors.primary, fontWeight: 'bold', fontSize: 18 },
  headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderColor: Colors.danger, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  logoutText: { color: Colors.danger, fontSize: 13 },
  tabsBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 60 },
  tab: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  tabLabelActive: { color: Colors.primary, fontWeight: '600' },
  content: { flex: 1, padding: 14 },
  qrCard: { backgroundColor: Colors.surface, borderTopWidth: 4, borderTopColor: Colors.primary, borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 14 },
  qrTitle: { color: Colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 },
  qrBox: { backgroundColor: Colors.white, padding: 12, borderRadius: 12, marginBottom: 10 },
  qrSimulated: { alignItems: 'center', padding: 10 },
  qrId: { color: Colors.textMuted, fontSize: 13 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dataLabel: { color: Colors.textMuted, fontSize: 13 },
  dataVal: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  asistenciaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  asistenciaDate: { color: Colors.text, fontWeight: '600', fontSize: 13, textTransform: 'capitalize' },
  asistenciaTime: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  empty: { color: Colors.textMuted, textAlign: 'center', fontSize: 14, paddingVertical: 10 },
  emptyCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  progressBar: { height: 8, backgroundColor: '#333', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  ejercicioCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  ejercicioDone: { borderColor: Colors.success, backgroundColor: 'rgba(25,135,84,0.12)' },
  ejercicioName: { color: Colors.text, fontWeight: '600', fontSize: 14, marginBottom: 4 },
  ejercicioDoneText: { textDecorationLine: 'line-through', color: Colors.success },
  ejercicioMuscle: { color: Colors.textMuted, fontSize: 12 },
  ejercicioStats: { marginHorizontal: 10, alignItems: 'center' },
  ejercicioStat: { color: Colors.textMuted, fontSize: 11 },
  checkbox: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#444', justifyContent: 'center', alignItems: 'center' },
  checkboxDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  finBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#444', borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 8 },
  finBtnReady: { backgroundColor: Colors.success, borderColor: Colors.success },
  finBtnText: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  membresiaCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 24, alignItems: 'center', width: '100%' },
  membresiaTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  membresiaInfo: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  membresiaInfoItem: { flex: 1, backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12 },
  membresiaVal: { color: Colors.text, fontWeight: 'bold', fontSize: 16, marginTop: 4 },
  renovarBtn: { marginTop: 20, borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30, width: '100%', alignItems: 'center' },
  renovarText: { color: Colors.primary, fontWeight: '700', fontSize: 15 },
  badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
