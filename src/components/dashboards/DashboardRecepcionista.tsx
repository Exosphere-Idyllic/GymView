// src/components/dashboards/DashboardRecepcionista.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import Colors from '../../theme/colors';
import { MOCK_CLIENTES, MOCK_ASISTENCIAS, MOCK_STATS } from '../../services/mock/mockData';
import { useAuth } from '../../store/AuthContext';
import { useRouter } from 'expo-router';

type Tab = 'resumen' | 'acceso' | 'socios' | 'pagos';

export default function DashboardRecepcionista() {
  const [activeTab, setActiveTab] = useState<Tab>('resumen');
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<null | { ok: boolean; msg: string; nombre?: string }>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'resumen', label: 'Resumen', icon: '📋' },
    { key: 'acceso', label: 'Acceso QR', icon: '📷' },
    { key: 'socios', label: 'Socios', icon: '👥' },
    { key: 'pagos', label: 'Caja', icon: '💰' },
  ];

  const simularEscaneo = (idManual?: string) => {
    const id = parseInt(idManual || qrInput);
    const cliente = MOCK_CLIENTES.find(c => c.id_cliente === id);
    if (!cliente) {
      setScanResult({ ok: false, msg: 'Cliente no encontrado' });
      return;
    }
    if (cliente.estadoMembresia === 'Vencida') {
      setScanResult({ ok: false, msg: `⚠️ Membresía VENCIDA\n${cliente.nombre} ${cliente.apellido}` });
      return;
    }
    setScanResult({ ok: true, msg: `✅ Acceso Permitido\n${cliente.nombre} ${cliente.apellido}\n${cliente.nombrePlan}`, nombre: cliente.nombre });
    setTimeout(() => setScanResult(null), 4000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚡ IRON DESK</Text>
          <Text style={styles.headerSub}>Recepcionista: {user?.nombre_completo}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/(auth)/login'); }}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsBar} contentContainerStyle={{ paddingHorizontal: 10 }}>
        {tabs.map((t) => (
          <TouchableOpacity key={t.key} style={[styles.tab, activeTab === t.key && styles.tabActive]} onPress={() => setActiveTab(t.key)}>
            <Text>{t.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* RESUMEN */}
        {activeTab === 'resumen' && (
          <>
            <View style={styles.actionsGrid}>
              {[
                { icon: '📷', label: 'Escanear Entrada', action: () => setActiveTab('acceso') },
                { icon: '💰', label: 'Registrar Pago', action: () => Alert.alert('Info', 'Ve a la pestaña Caja') },
                { icon: '➕', label: 'Nuevo Socio', action: () => router.push('/clientes/crear') },
              ].map((btn, i) => (
                <TouchableOpacity key={i} style={styles.actionCard} onPress={btn.action}>
                  <Text style={styles.actionIcon}>{btn.icon}</Text>
                  <Text style={styles.actionLabel}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statMini, { borderLeftColor: Colors.success }]}>
                <Text style={styles.statMiniVal}>${MOCK_STATS.ingresosMes}</Text>
                <Text style={styles.statMiniLabel}>Ingresos Hoy</Text>
              </View>
              <View style={[styles.statMini, { borderLeftColor: Colors.primary }]}>
                <Text style={styles.statMiniVal}>{MOCK_STATS.personasEntrenando}</Text>
                <Text style={styles.statMiniLabel}>Entrenando</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            {MOCK_ASISTENCIAS.slice(0, 4).map((a) => {
              const c = MOCK_CLIENTES.find(cl => cl.id_cliente === a.id_cliente);
              return (
                <View key={a.id_asistencia} style={styles.rowItem}>
                  <Text style={{ fontSize: 22 }}>{a.fecha_hora_salida ? '🚪' : '👋'}</Text>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.rowName}>{c?.nombre} {c?.apellido}</Text>
                    <Text style={styles.rowSub}>{a.fecha_hora_salida ? 'Salida' : 'Entrada'} · {a.dispositivo_qr}</Text>
                  </View>
                  <Text style={styles.rowTime}>{new Date(a.fecha_hora_ingreso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              );
            })}
          </>
        )}

        {/* ACCESO QR */}
        {activeTab === 'acceso' && (
          <View style={{ alignItems: 'center' }}>
            <View style={styles.scannerBox}>
              <Text style={{ fontSize: 64 }}>📷</Text>
              <Text style={styles.scannerLabel}>Escáner Activo</Text>
              <Text style={styles.scannerSub}>Esperando lectura de código QR...</Text>
            </View>

            {/* Resultado visual */}
            {scanResult && (
              <View style={[styles.scanResult, { backgroundColor: scanResult.ok ? '#1a3d2b' : '#3d1a1a', borderColor: scanResult.ok ? Colors.success : Colors.danger }]}>
                <Text style={[styles.scanResultText, { color: scanResult.ok ? Colors.success : Colors.danger }]}>{scanResult.msg}</Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 20, alignSelf: 'flex-start' }]}>O ingresa el ID manualmente</Text>
            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                placeholder="Ej: 1, 2, 3..."
                placeholderTextColor="#666"
                value={qrInput}
                onChangeText={setQrInput}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.validateBtn} onPress={() => simularEscaneo()}>
                <Text style={styles.validateBtnText}>Validar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Simular clientes</Text>
            {MOCK_CLIENTES.map(c => (
              <TouchableOpacity key={c.id_cliente} style={styles.rowItem} onPress={() => simularEscaneo(String(c.id_cliente))}>
                <View style={[styles.avatar, { backgroundColor: c.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                  <Text style={styles.avatarText}>{c.nombre[0]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.rowName}>{c.nombre} {c.apellido}</Text>
                  <Text style={styles.rowSub}>{c.nombrePlan} · {c.estadoMembresia}</Text>
                </View>
                <Text style={styles.scanBtn}>Escanear</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SOCIOS */}
        {activeTab === 'socios' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Directorio de Socios</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/clientes/crear')}>
                <Text style={styles.addBtnText}>+ Nuevo</Text>
              </TouchableOpacity>
            </View>
            {MOCK_CLIENTES.map(c => (
              <View key={c.id_cliente} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{c.nombre[0]}</Text></View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.rowName}>{c.nombre} {c.apellido}</Text>
                    <Text style={styles.rowSub}>{c.email} · {c.telefono}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: c.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                    <Text style={styles.badgeText}>{c.estadoMembresia}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* CAJA */}
        {activeTab === 'pagos' && (
          <>
            <Text style={styles.sectionTitle}>Registro de Caja</Text>
            <TouchableOpacity style={styles.bigAction} onPress={() => Alert.alert('Pago', 'Funcionalidad conectada al API')}>
              <Text style={{ fontSize: 32 }}>💳</Text>
              <Text style={styles.bigActionLabel}>Registrar Nuevo Pago</Text>
            </TouchableOpacity>
            <View style={[styles.statMini, { borderLeftColor: Colors.success, marginBottom: 16 }]}>
              <Text style={styles.statMiniLabel}>Total del Mes</Text>
              <Text style={[styles.statMiniVal, { color: Colors.success }]}>$119.96</Text>
            </View>
            {MOCK_CLIENTES.map(c => (
              <View key={c.id_cliente} style={styles.rowItem}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{c.nombre[0]}</Text></View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.rowName}>{c.nombre} {c.apellido}</Text>
                  <Text style={styles.rowSub}>{c.nombrePlan} · Vence: {c.fecha_vencimiento}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: c.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                  <Text style={styles.badgeText}>{c.estadoMembresia}</Text>
                </View>
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
  actionsGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionCard: { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionLabel: { color: Colors.text, fontSize: 12, textAlign: 'center', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statMini: { flex: 1, backgroundColor: Colors.surface, borderLeftWidth: 4, borderRadius: 10, padding: 14, borderColor: Colors.primary },
  statMiniVal: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  statMiniLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  addBtnText: { color: Colors.black, fontWeight: '700', fontSize: 13 },
  rowItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  rowName: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  rowSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  rowTime: { color: Colors.textMuted, fontSize: 12 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.black, fontWeight: 'bold', fontSize: 16 },
  badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  scannerBox: { backgroundColor: '#111', borderWidth: 2, borderColor: Colors.primary, borderRadius: 20, padding: 40, alignItems: 'center', marginBottom: 16, width: '100%' },
  scannerLabel: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  scannerSub: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  scanResult: { borderWidth: 2, borderRadius: 12, padding: 16, marginBottom: 12, width: '100%' },
  scanResultText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  manualRow: { flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%' },
  manualInput: { flex: 1, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 12, color: Colors.text },
  validateBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 18, justifyContent: 'center' },
  validateBtnText: { color: Colors.black, fontWeight: '700' },
  scanBtn: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
  bigAction: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 16 },
  bigActionLabel: { color: Colors.text, fontSize: 16, fontWeight: '700', marginTop: 8 },
});
