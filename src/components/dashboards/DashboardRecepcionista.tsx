// src/components/dashboards/DashboardRecepcionista.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, Modal } from 'react-native';
import Colors from '../../theme/colors';
import { useAuth } from '../../store/AuthContext';
import { useRouter } from 'expo-router';
import asistenciaService, { AccesoResponse } from '../../services/asistencia.service';
import membresiaService, { PLANES_MEMBRESIA } from '../../services/membresia.service';
import apiClient from '../../services/api.client';
import { API_CONFIG } from '../../config/api.config';

type Tab = 'resumen' | 'acceso' | 'socios' | 'pagos';

// Tipos basados en las respuestas reales del backend (AsistenciaController.java)
interface ReporteDia {
  totalEntradas: number;
  totalSalidas: number;
  entradasSinCerrar: number;
  movimientos: { idAsistencia: number; nombre: string; entrada: string; salida: string | null }[];
}

interface ClientePresente {
  idAsistencia: number;
  idCliente: number;
  nombre: string;
  plan: string;
  horaIngreso: string;
  minutosEnGimnasio: number;
}

interface EstadoCliente {
  nombre: string;
  estadoMembresia: string;
  plan: string;
  fechaVencimiento: string;
  diasRestantes: number;
  puedeEntrar: boolean;
  dentroPorDia: boolean;
  alerta: string | null;
}

export default function DashboardRecepcionista() {
  const [activeTab, setActiveTab] = useState<Tab>('resumen');
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<null | { ok: boolean; msg: string }>(null);
  const [estadoCliente, setEstadoCliente] = useState<EstadoCliente | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [buscandoEstado, setBuscandoEstado] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // ── Estado API ──────────────────────────────────────────────
  const [reporteDia, setReporteDia] = useState<ReporteDia | null>(null);
  const [presentes, setPresentes] = useState<ClientePresente[]>([]);
  const [totalPresentes, setTotalPresentes] = useState(0);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [loadingSocios, setLoadingSocios] = useState(false);

  // ── Estado Modal Membresía ──────────────────────────────────
  const [modalMembresia, setModalMembresia] = useState(false);
  const [savingMembresia, setSavingMembresia] = useState(false);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'resumen', label: 'Resumen', icon: '📋' },
    { key: 'acceso', label: 'Acceso QR', icon: '📷' },
    { key: 'socios', label: 'Presentes', icon: '👥' },
    { key: 'pagos', label: 'Turno', icon: '📊' },
  ];

  // ── Carga: reporte del día (GET /api/accesos/reporte-dia) ───
  const cargarResumen = useCallback(async () => {
    setLoadingResumen(true);
    try {
      const data = await apiClient.get<ReporteDia>(API_CONFIG.ENDPOINTS.ACCESOS.REPORTE_DIA);
      setReporteDia(data);
    } catch (_) {
      // Si no hay datos, no bloqueamos la UI
    } finally {
      setLoadingResumen(false);
    }
  }, []);

  // ── Carga: clientes presentes (GET /api/accesos/presentes) ──
  const cargarPresentes = useCallback(async () => {
    setLoadingSocios(true);
    try {
      const data = await apiClient.get<{ total: number; clientes: ClientePresente[] }>(
        API_CONFIG.ENDPOINTS.ACCESOS.PRESENTES
      );
      setPresentes(data.clientes ?? []);
      setTotalPresentes(data.total ?? 0);
    } catch (_) {
      setPresentes([]);
    } finally {
      setLoadingSocios(false);
    }
  }, []);

  useEffect(() => {
    cargarResumen();
  }, []);

  useEffect(() => {
    if (activeTab === 'socios') cargarPresentes();
    if (activeTab === 'resumen') cargarResumen();
    if (activeTab === 'pagos') cargarResumen(); // reutilizamos reporte-dia para cierre de turno
  }, [activeTab]);

  // ── Buscar estado del cliente antes de escanear ─────────────
  const buscarEstadoCliente = async (idStr: string) => {
    const id = parseInt(idStr);
    if (isNaN(id) || id <= 0) return;
    setBuscandoEstado(true);
    setEstadoCliente(null);
    try {
      const data = await apiClient.get<EstadoCliente>(
        API_CONFIG.ENDPOINTS.ACCESOS.ESTADO(id)
      );
      setEstadoCliente(data);
    } catch (_) {
      setEstadoCliente(null);
    } finally {
      setBuscandoEstado(false);
    }
  };

  // ── Procesar escaneo (POST /api/accesos/escanear/{id}) ──────
  const procesarEscaneo = async (idStr: string) => {
    const id = parseInt(idStr);
    if (isNaN(id) || id <= 0) {
      Alert.alert('', 'Ingresa un ID de usuario válido');
      return;
    }
    setQrInput('');
    setEstadoCliente(null);
    setProcesando(true);
    try {
      const res: AccesoResponse = await asistenciaService.escanear(id);
      setScanResult({
        ok: true,
        msg: res.mensaje || (res.tipo === 'ENTRADA' ? '✅ ENTRADA registrada' : '👋 SALIDA registrada'),
      });
      // Recargar presentes si aplica
      if (activeTab === 'socios') cargarPresentes();
    } catch (e: any) {
      setScanResult({ ok: false, msg: `❌ ${e.message}` });
    } finally {
      setProcesando(false);
      setTimeout(() => setScanResult(null), 5000);
    }
  };

  const asignarMembresia = async (idPlan: number) => {
    const id = parseInt(qrInput);
    if (isNaN(id) || id <= 0) return;
    setSavingMembresia(true);
    try {
      await membresiaService.asignar(id, idPlan);
      Alert.alert('✅ Éxito', '¡Membresía renovada exitosamente!');
      setModalMembresia(false);
      buscarEstadoCliente(qrInput);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingMembresia(false);
    }
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

        {/* ─── RESUMEN ─── */}
        {activeTab === 'resumen' && (
          <>
            <View style={styles.actionsGrid}>
              {[
                { icon: '📷', label: 'Escanear Entrada', action: () => setActiveTab('acceso') },
                { icon: '👥', label: 'Ver Presentes', action: () => setActiveTab('socios') },
                { icon: '➕', label: 'Nuevo Socio', action: () => router.push('/clientes/crear') },
              ].map((btn, i) => (
                <TouchableOpacity key={i} style={styles.actionCard} onPress={btn.action}>
                  <Text style={styles.actionIcon}>{btn.icon}</Text>
                  <Text style={styles.actionLabel}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {loadingResumen ? (
              <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} />
            ) : (
              <View style={styles.statsRow}>
                <View style={[styles.statMini, { borderLeftColor: Colors.success }]}>
                  <Text style={styles.statMiniVal}>{reporteDia?.totalEntradas ?? 0}</Text>
                  <Text style={styles.statMiniLabel}>Entradas Hoy</Text>
                </View>
                <View style={[styles.statMini, { borderLeftColor: Colors.primary }]}>
                  <Text style={styles.statMiniVal}>{reporteDia?.entradasSinCerrar ?? 0}</Text>
                  <Text style={styles.statMiniLabel}>En Gimnasio</Text>
                </View>
                <View style={[styles.statMini, { borderLeftColor: Colors.warning }]}>
                  <Text style={styles.statMiniVal}>{reporteDia?.totalSalidas ?? 0}</Text>
                  <Text style={styles.statMiniLabel}>Salidas</Text>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
            {!reporteDia || reporteDia.movimientos.length === 0 ? (
              <Text style={{ color: Colors.textMuted, fontSize: 13 }}>Sin movimientos hoy</Text>
            ) : (
              reporteDia.movimientos.slice(-5).reverse().map((m) => (
                <View key={m.idAsistencia} style={styles.rowItem}>
                  <Text style={{ fontSize: 22 }}>{m.salida ? '🚪' : '👋'}</Text>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.rowName}>{m.nombre}</Text>
                    <Text style={styles.rowSub}>{m.salida ? `Salida: ${m.salida}` : 'En gimnasio'}</Text>
                  </View>
                  <Text style={styles.rowTime}>{m.entrada}</Text>
                </View>
              ))
            )}
          </>
        )}

        {/* ─── ACCESO QR ─── */}
        {activeTab === 'acceso' && (
          <View style={{ alignItems: 'center' }}>
            <View style={styles.scannerBox}>
              <Text style={{ fontSize: 64 }}>📷</Text>
              <Text style={styles.scannerLabel}>Escáner Activo</Text>
              <Text style={styles.scannerSub}>
                {procesando ? 'Procesando...' : 'Ingresa el ID de usuario para registrar acceso'}
              </Text>
            </View>

            {scanResult && (
              <View style={[styles.scanResult, {
                backgroundColor: scanResult.ok ? '#1a3d2b' : '#3d1a1a',
                borderColor: scanResult.ok ? Colors.success : Colors.danger
              }]}>
                <Text style={[styles.scanResultText, { color: scanResult.ok ? Colors.success : Colors.danger }]}>
                  {scanResult.msg}
                </Text>
              </View>
            )}

            {/* Vista previa del cliente */}
            {estadoCliente && !procesando && (
              <View style={[styles.clientePreview, { borderColor: estadoCliente.puedeEntrar ? Colors.success : Colors.danger }]}>
                <Text style={styles.clientePreviewNombre}>{estadoCliente.nombre}</Text>
                <Text style={styles.clientePreviewSub}>📋 {estadoCliente.plan} · {estadoCliente.estadoMembresia}</Text>
                {estadoCliente.alerta && (
                  <Text style={{ color: Colors.warning, fontSize: 12, marginTop: 4 }}>{estadoCliente.alerta}</Text>
                )}
                <Text style={{ color: Colors.textMuted, fontSize: 11, marginTop: 2 }}>
                  {estadoCliente.dentroPorDia ? '🟢 Ya está dentro — se marcará SALIDA' : '🔵 No ha entrado hoy — se marcará ENTRADA'}
                </Text>

                {(!estadoCliente.puedeEntrar || estadoCliente.estadoMembresia === 'Vencida' || estadoCliente.estadoMembresia === 'Inactiva') && (
                  <TouchableOpacity style={{ marginTop: 14, padding: 12, backgroundColor: Colors.warning, borderRadius: 8, alignItems: 'center' }} onPress={() => setModalMembresia(true)}>
                    <Text style={{ color: Colors.black, fontWeight: 'bold' }}>💳 Vender / Renovar Membresía</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 20, alignSelf: 'flex-start' }]}>
              ID de usuario
            </Text>
            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                placeholder="Ej: 7, 8, 9..."
                placeholderTextColor="#666"
                value={qrInput}
                onChangeText={(v) => {
                  setQrInput(v);
                  if (v.length >= 1) buscarEstadoCliente(v);
                  else setEstadoCliente(null);
                }}
                keyboardType="numeric"
                editable={!procesando}
              />
              <TouchableOpacity
                style={[styles.validateBtn, (!qrInput || procesando) && { opacity: 0.6 }]}
                onPress={() => { if (qrInput) procesarEscaneo(qrInput); }}
                disabled={!qrInput || procesando}
              >
                {procesando
                  ? <ActivityIndicator color={Colors.black} size="small" />
                  : <Text style={styles.validateBtnText}>✅ Registrar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── PRESENTES ─── */}
        {activeTab === 'socios' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>En el Gimnasio Ahora</Text>
              <TouchableOpacity style={styles.addBtn} onPress={cargarPresentes}>
                <Text style={styles.addBtnText}>🔄 Actualizar</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.statMini, { borderLeftColor: Colors.success, marginBottom: 16 }]}>
              <Text style={styles.statMiniVal}>{totalPresentes}</Text>
              <Text style={styles.statMiniLabel}>Personas dentro</Text>
            </View>
            {loadingSocios ? (
              <ActivityIndicator color={Colors.primary} />
            ) : presentes.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 30 }}>
                <Text style={{ color: Colors.textMuted }}>No hay clientes en el gimnasio ahora</Text>
              </View>
            ) : (
              presentes.map(c => (
                <View key={c.idAsistencia} style={styles.card}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.avatar, { backgroundColor: Colors.success }]}>
                      <Text style={styles.avatarText}>{c.nombre[0]}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.rowName}>{c.nombre}</Text>
                      <Text style={styles.rowSub}>📋 {c.plan}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>{c.horaIngreso}</Text>
                      <Text style={{ color: Colors.textMuted, fontSize: 11 }}>{c.minutosEnGimnasio}min</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ─── TURNO / CIERRE DE DÍA ─── */}
        {activeTab === 'pagos' && (
          <>
            <Text style={styles.sectionTitle}>Resumen de Turno</Text>
            {loadingResumen ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <>
                <View style={styles.statsRow}>
                  <View style={[styles.statMini, { borderLeftColor: Colors.success }]}>
                    <Text style={styles.statMiniVal}>{reporteDia?.totalEntradas ?? 0}</Text>
                    <Text style={styles.statMiniLabel}>Entradas</Text>
                  </View>
                  <View style={[styles.statMini, { borderLeftColor: Colors.danger }]}>
                    <Text style={styles.statMiniVal}>{reporteDia?.totalSalidas ?? 0}</Text>
                    <Text style={styles.statMiniLabel}>Salidas</Text>
                  </View>
                  <View style={[styles.statMini, { borderLeftColor: Colors.warning }]}>
                    <Text style={styles.statMiniVal}>{reporteDia?.entradasSinCerrar ?? 0}</Text>
                    <Text style={styles.statMiniLabel}>Sin cerrar</Text>
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Todos los movimientos de hoy</Text>
                {!reporteDia || reporteDia.movimientos.length === 0 ? (
                  <Text style={{ color: Colors.textMuted }}>Sin movimientos registrados hoy</Text>
                ) : (
                  reporteDia.movimientos.map(m => (
                    <View key={m.idAsistencia} style={styles.rowItem}>
                      <Text style={{ fontSize: 20 }}>{m.salida ? '🚪' : '🟢'}</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.rowName}>{m.nombre}</Text>
                        <Text style={styles.rowSub}>Entrada: {m.entrada} {m.salida ? `· Salida: ${m.salida}` : '· Aún dentro'}</Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </>
        )}

      </ScrollView>

      {/* ─── Modal Asignar Membresía ─── */}
      <Modal visible={modalMembresia} animationType="slide" transparent onRequestClose={() => setModalMembresia(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎫 Elige un Plan para Renovación</Text>

            {PLANES_MEMBRESIA.map(plan => (
              <TouchableOpacity
                key={plan.id}
                style={{ backgroundColor: '#212529', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                onPress={() => asignarMembresia(plan.id)}
                disabled={savingMembresia}
              >
                <View>
                  <Text style={{ color: Colors.text, fontSize: 16, fontWeight: '600' }}>{plan.nombre}</Text>
                  <Text style={{ color: Colors.textMuted, fontSize: 12, marginTop: 4 }}>{plan.dias} días libres</Text>
                </View>
                <Text style={{ color: Colors.success, fontSize: 18, fontWeight: 'bold' }}>${plan.precio}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ marginTop: 20 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalMembresia(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
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
  statMini: { flex: 1, backgroundColor: Colors.surface, borderLeftWidth: 4, borderRadius: 10, padding: 12 },
  statMiniVal: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  statMiniLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  addBtnText: { color: Colors.black, fontWeight: '700', fontSize: 13 },
  rowItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  rowName: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  rowSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  rowTime: { color: Colors.textMuted, fontSize: 12, fontWeight: 'bold' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 18, marginBottom: 20, textAlign: 'center' },
  cancelBtn: { backgroundColor: 'transparent', paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  cancelText: { color: Colors.textMuted, fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.black, fontWeight: 'bold', fontSize: 16 },
  scannerBox: { backgroundColor: '#111', borderWidth: 2, borderColor: Colors.primary, borderRadius: 20, padding: 40, alignItems: 'center', marginBottom: 16, width: '100%' },
  scannerLabel: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  scannerSub: { color: Colors.textMuted, fontSize: 13, marginTop: 4, textAlign: 'center' },
  scanResult: { borderWidth: 2, borderRadius: 12, padding: 16, marginBottom: 12, width: '100%' },
  scanResultText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  clientePreview: { borderWidth: 2, borderRadius: 12, padding: 14, marginBottom: 12, width: '100%', backgroundColor: '#1a1a2e' },
  clientePreviewNombre: { color: Colors.text, fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  clientePreviewSub: { color: Colors.textMuted, fontSize: 13 },
  manualRow: { flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%' },
  manualInput: { flex: 1, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444', borderRadius: 10, padding: 12, color: Colors.text },
  validateBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', minWidth: 100 },
  validateBtnText: { color: Colors.black, fontWeight: '700' },
  warning: { color: Colors.warning },
});
