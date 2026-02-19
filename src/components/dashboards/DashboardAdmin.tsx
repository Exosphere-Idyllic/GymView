// src/components/dashboards/DashboardAdmin.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, FlatList,
} from 'react-native';
import Colors from '../../theme/colors';
import { MOCK_STATS, MOCK_CLIENTES, MOCK_ENTRENADORES, MOCK_PAGOS, MOCK_LOGS_ACCESO } from '../../services/mock/mockData';
import { useAuth } from '../../store/AuthContext';
import { useRouter } from 'expo-router';

type Tab = 'resumen' | 'clientes' | 'entrenadores' | 'pagos' | 'logs';

export default function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>('resumen');
  const { user, logout } = useAuth();
  const router = useRouter();

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'resumen', label: 'Resumen', icon: '📊' },
    { key: 'clientes', label: 'Clientes', icon: '👥' },
    { key: 'entrenadores', label: 'Entrenadores', icon: '🏋️' },
    { key: 'pagos', label: 'Pagos', icon: '💰' },
    { key: 'logs', label: 'Accesos', icon: '🔐' },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const statCards = [
    { label: 'Clientes Activos', value: MOCK_STATS.clientesActivos, icon: '👥', color: Colors.primary },
    { label: 'Ingresos (Mes)', value: `$${MOCK_STATS.ingresosMes}`, icon: '💵', color: Colors.success },
    { label: 'Asistencias Hoy', value: MOCK_STATS.asistenciasHoy, icon: '📷', color: Colors.info },
    { label: 'Membresías Vencidas', value: MOCK_STATS.membresiasVencidas, icon: '⚠️', color: Colors.danger },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚡ IRON ADMIN</Text>
          <Text style={styles.headerSub}>Hola, {user?.nombre_completo}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Nav Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsBar} contentContainerStyle={{ paddingHorizontal: 12 }}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* ─── RESUMEN ─── */}
        {activeTab === 'resumen' && (
          <>
            <View style={styles.statsGrid}>
              {statCards.map((s, i) => (
                <View key={i} style={[styles.statCard, { borderLeftColor: s.color }]}>
                  <Text style={styles.statIcon}>{s.icon}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Últimos Accesos al Sistema</Text>
            {MOCK_LOGS_ACCESO.slice(0, 4).map((log) => (
              <View key={log.id_log} style={styles.logRow}>
                <View style={styles.logAvatar}>
                  <Text style={styles.logAvatarText}>{log.usuario.substring(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.logUser}>{log.usuario} <Text style={styles.logRol}>({log.rol})</Text></Text>
                  <Text style={styles.logDetail}>{log.ip_acceso} · {log.tipo_dispositivo}</Text>
                </View>
                <Text style={styles.logTime}>{new Date(log.fecha_hora_acceso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            ))}
          </>
        )}

        {/* ─── CLIENTES ─── */}
        {activeTab === 'clientes' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gestión de Clientes</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/clientes/crear')}>
                <Text style={styles.addBtnText}>+ Nuevo</Text>
              </TouchableOpacity>
            </View>
            {MOCK_CLIENTES.map((c) => (
              <TouchableOpacity key={c.id_cliente} style={styles.card} onPress={() => router.push(`/clientes/${c.id_cliente}`)}>
                <View style={styles.cardRow}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{c.nombre[0]}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{c.nombre} {c.apellido}</Text>
                    <Text style={styles.cardSub}>{c.email}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: c.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                    <Text style={styles.badgeText}>{c.estadoMembresia}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>📋 {c.nombrePlan}</Text>
                  <Text style={styles.cardFooterText}>📅 Vence: {c.fecha_vencimiento}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ─── ENTRENADORES ─── */}
        {activeTab === 'entrenadores' && (
          <>
            <Text style={styles.sectionTitle}>Entrenadores</Text>
            {MOCK_ENTRENADORES.map((e) => (
              <View key={e.id_entrenador} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={[styles.avatar, { backgroundColor: '#1565C0' }]}>
                    <Text style={styles.avatarText}>{e.nombre[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{e.nombre} {e.apellido}</Text>
                    <Text style={styles.cardSub}>{e.especialidad}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>👥 {e.totalAlumnos} alumnos</Text>
                  <Text style={styles.cardFooterText}>📋 {e.rutinasCreadas} rutinas</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ─── PAGOS ─── */}
        {activeTab === 'pagos' && (
          <>
            <Text style={styles.sectionTitle}>Historial de Pagos</Text>
            <View style={[styles.statCard, { borderLeftColor: Colors.success, marginBottom: 16 }]}>
              <Text style={styles.statLabel}>Total Recaudado</Text>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                ${MOCK_PAGOS.reduce((a, p) => a + p.monto, 0).toFixed(2)}
              </Text>
            </View>
            {MOCK_PAGOS.map((p) => {
              const cliente = MOCK_CLIENTES.find(c => c.id_cliente === p.id_cliente);
              return (
                <View key={p.id_pago} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View>
                      <Text style={styles.cardName}>{cliente?.nombre} {cliente?.apellido}</Text>
                      <Text style={styles.cardSub}>{p.metodo_pago} · {p.fecha_pago}</Text>
                    </View>
                    <Text style={[styles.statValue, { color: Colors.success, fontSize: 20 }]}>${p.monto}</Text>
                  </View>
                  {p.observaciones ? <Text style={styles.logDetail}>📝 {p.observaciones}</Text> : null}
                </View>
              );
            })}
          </>
        )}

        {/* ─── LOGS ─── */}
        {activeTab === 'logs' && (
          <>
            <Text style={styles.sectionTitle}>Registro de Accesos (RF09)</Text>
            {MOCK_LOGS_ACCESO.map((log) => (
              <View key={log.id_log} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.logAvatar}>
                    <Text style={styles.logAvatarText}>{log.usuario.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{log.usuario} <Text style={{ color: Colors.primary }}>({log.rol})</Text></Text>
                    <Text style={styles.cardSub}>IP: {log.ip_acceso} · {log.tipo_dispositivo}</Text>
                  </View>
                </View>
                <Text style={styles.logDetail}>🕐 {new Date(log.fecha_hora_acceso).toLocaleString('es')}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTitle: { color: Colors.primary, fontWeight: 'bold', fontSize: 18 },
  headerSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  logoutBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.danger, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  logoutText: { color: Colors.danger, fontSize: 13 },
  tabsBar: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, maxHeight: 60 },
  tab: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: Colors.primary },
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  tabLabelActive: { color: Colors.primary, fontWeight: '600' },
  content: { flex: 1, padding: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 10 },
  statCard: {
    backgroundColor: Colors.surfaceAlt, borderLeftWidth: 4, borderRadius: 10,
    padding: 14, width: '47%', borderColor: Colors.primary,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  addBtnText: { color: Colors.black, fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: Colors.black, fontWeight: 'bold', fontSize: 16 },
  cardName: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  cardSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  cardFooterText: { color: Colors.textMuted, fontSize: 12 },
  logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  logAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logAvatarText: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 },
  logUser: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  logRol: { color: Colors.textMuted, fontSize: 12 },
  logDetail: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  logTime: { color: Colors.textMuted, fontSize: 12 },
});
