// app/clientes/[id].tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import apiClient from '../../src/services/api.client';
import { API_CONFIG } from '../../src/config/api.config';

export default function ClienteDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatosCliente = useCallback(async () => {
    try {
      setLoading(true);
      // Peticiones al backend en paralelo
      const [clienteData, dashboardData, pagosData, historialData] = await Promise.all([
        // Info basica del usuario
        apiClient.get(API_CONFIG.ENDPOINTS.USUARIOS.BY_ID(parseInt(id))),
        // Info del dashboard cliente (rutinas, membresia activa)
        apiClient.get(API_CONFIG.ENDPOINTS.CLIENTES.DASHBOARD(parseInt(id))).catch(() => null),
        // Pagos del cliente
        apiClient.get(API_CONFIG.ENDPOINTS.CLIENTES.PAGOS(parseInt(id))).catch(() => []),
        // Historial asistencias
        apiClient.get(API_CONFIG.ENDPOINTS.ACCESOS.HISTORIAL(parseInt(id))).catch(() => [])
      ]);

      // Unificar data con verificación de tipos para evitar errores de lint
      const cliData = (clienteData as any) || {};
      const dashData = (dashboardData as any) || {};

      const cli = {
        ...cliData,
        estadoMembresia: dashData?.estadoMembresia || 'Desconocido',
        nombrePlan: dashData?.nombrePlan || 'N/A',
        fecha_vencimiento: dashData?.vencimiento || 'N/A'
      };

      setCliente(cli);
      setRutinas(dashData?.rutinaActual ? [dashData.rutinaActual] : []);
      setPagos(Array.isArray(pagosData) ? pagosData : []);
      setAsistencias(Array.isArray(historialData) ? historialData : []);
    } catch (error) {
      console.error('Error al cargar detalle cliente:', error);
      Alert.alert('Error', 'No se pudieron recuperar los datos del cliente desde el servidor.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDatosCliente();
  }, [cargarDatosCliente]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ color: Colors.text, marginTop: 10 }}>Cargando información del cliente...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cliente) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.text }}>Cliente no encontrado en la base de datos.</Text>
      </View>
    </SafeAreaView>
  );

  const activa = cliente.estadoMembresia === 'Activa';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle Cliente</Text>
        <TouchableOpacity onPress={() => Alert.alert('Editar', 'Se conectará al API')}><Text style={{ color: Colors.primary }}>Editar</Text></TouchableOpacity>
      </View>

      <ScrollView style={{ padding: 14 }} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Perfil */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: activa ? Colors.success : Colors.danger }]}>
            <Text style={styles.avatarText}>{cliente.nombre[0]}</Text>
          </View>
          <Text style={styles.nombre}>{cliente.nombre} {cliente.apellido}</Text>
          <View style={[styles.badge, { backgroundColor: activa ? Colors.success : Colors.danger }]}>
            <Text style={styles.badgeText}>{activa ? '✅ Membresía Activa' : '❌ Membresía Vencida'}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información Personal</Text>
          {[
            { l: 'Email', v: cliente.email },
            { l: 'Teléfono', v: cliente.telefono },
            { l: 'Nacimiento', v: cliente.fecha_nacimiento },
            { l: 'Plan', v: cliente.nombrePlan },
            { l: 'Vencimiento', v: cliente.fecha_vencimiento },
          ].map((d, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rowLabel}>{d.l}</Text>
              <Text style={styles.rowVal}>{d.v}</Text>
            </View>
          ))}
        </View>

        {/* Rutinas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rutinas Asignadas ({rutinas.length})</Text>
          {rutinas.length === 0 ? <Text style={styles.empty}>Sin rutinas asignadas</Text>
            : rutinas.map((r, idx) => (
              <View key={r.idRutina || idx} style={styles.chip}>
                <Text style={styles.chipTitle}>🏋️ {r.nombreRutina || r.nombre_rutina}</Text>
                <Text style={styles.chipSub}>{r.ejercicios?.length || 0} ejercicios activos</Text>
              </View>
            ))
          }
        </View>

        {/* Asistencias */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial de Asistencia ({asistencias.length})</Text>
          {asistencias.length === 0 ? <Text style={styles.empty}>Sin registros de asistencia</Text> 
            : asistencias.slice(0, 5).map((a, idx) => (
            <View key={a.id_asistencia || idx} style={styles.row}>
              <Text style={styles.rowLabel}>{new Date(a.fecha_hora_ingreso || a.fechaHoraIngreso).toLocaleDateString('es')}</Text>
              <Text style={styles.rowVal}>{new Date(a.fecha_hora_ingreso || a.fechaHoraIngreso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          ))}
        </View>

        {/* Pagos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial de Pagos ({pagos.length})</Text>
          {pagos.length === 0 ? <Text style={styles.empty}>Sin pagos registrados</Text>
            : pagos.map((p, idx) => (
            <View key={p.id_pago || idx} style={styles.row}>
              <Text style={styles.rowLabel}>{new Date(p.fecha_pago || p.fechaPago).toLocaleDateString('es')} · {p.metodo_pago || p.metodoPago || 'EFECTIVO'}</Text>
              <Text style={[styles.rowVal, { color: Colors.success }]}>${p.monto_pagado || p.montoPagado || p.monto || '0.00'}</Text>
            </View>
          ))}
        </View>

        {/* Acciones */}
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.danger }]} onPress={() => Alert.alert('Información', 'Para inactivar a un cliente, edite su usuario desde la tabla de Administración.')}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>⛔ Inactivar Cliente</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { color: Colors.primary, fontSize: 15 },
  headerTitle: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
  profileCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  nombre: { color: Colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  badge: { borderRadius: 8, paddingVertical: 5, paddingHorizontal: 14 },
  badgeText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 12 },
  cardTitle: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { color: Colors.textMuted, fontSize: 13 },
  rowVal: { color: Colors.text, fontSize: 13, fontWeight: '600' },
  chip: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 10, marginBottom: 8 },
  chipTitle: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  chipSub: { color: Colors.textMuted, fontSize: 12, marginTop: 3 },
  empty: { color: Colors.textMuted, textAlign: 'center', paddingVertical: 10 },
  actionBtn: { borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
});
