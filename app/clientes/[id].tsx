// app/clientes/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import { MOCK_CLIENTES, MOCK_RUTINAS, MOCK_ASISTENCIAS, MOCK_PAGOS } from '../../src/services/mock/mockData';

export default function ClienteDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cliente = MOCK_CLIENTES.find(c => c.id_cliente === parseInt(id));

  if (!cliente) return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.text }}>Cliente no encontrado</Text>
      </View>
    </SafeAreaView>
  );

  const rutinas = MOCK_RUTINAS.filter(r => r.id_cliente === cliente.id_cliente);
  const asistencias = MOCK_ASISTENCIAS.filter(a => a.id_cliente === cliente.id_cliente);
  const pagos = MOCK_PAGOS.filter(p => p.id_cliente === cliente.id_cliente);
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
            : rutinas.map(r => (
              <View key={r.id_rutina} style={styles.chip}>
                <Text style={styles.chipTitle}>🏋️ {r.nombre_rutina}</Text>
                <Text style={styles.chipSub}>{r.ejercicios.length} ejercicios · {r.fecha_creacion}</Text>
              </View>
            ))
          }
        </View>

        {/* Asistencias */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial de Asistencia ({asistencias.length})</Text>
          {asistencias.slice(0, 5).map(a => (
            <View key={a.id_asistencia} style={styles.row}>
              <Text style={styles.rowLabel}>{new Date(a.fecha_hora_ingreso).toLocaleDateString('es')}</Text>
              <Text style={styles.rowVal}>{new Date(a.fecha_hora_ingreso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          ))}
        </View>

        {/* Pagos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial de Pagos ({pagos.length})</Text>
          {pagos.map(p => (
            <View key={p.id_pago} style={styles.row}>
              <Text style={styles.rowLabel}>{p.fecha_pago} · {p.metodo_pago}</Text>
              <Text style={[styles.rowVal, { color: Colors.success }]}>${p.monto}</Text>
            </View>
          ))}
        </View>

        {/* Acciones */}
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.danger }]} onPress={() => Alert.alert('Inactivar', 'Se conectará al API')}>
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
