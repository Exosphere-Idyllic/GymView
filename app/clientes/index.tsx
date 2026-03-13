// app/clientes/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import authService, { AdminUsuario } from '../../src/services/auth.service';

export default function ClientesIndex() {
  const router = useRouter();
  const [clientes, setClientes] = useState<AdminUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarClientes = useCallback(async () => {
    try {
      setLoading(true);
      const usuarios = await authService.getUsuariosAdmin();
      // Filtrar aquellos que sean clientes (idRol 4 o rol 'cliente')
      const soloClientes = usuarios.filter(u => u.rol === 'cliente' || u.rol === 'Cliente');
      setClientes(soloClientes);
    } catch (e) {
      console.error('Error cargando clientes:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Gestión de Clientes</Text>
        <TouchableOpacity onPress={() => router.push('/clientes/crear')} style={styles.addBtn}><Text style={styles.addText}>+ Nuevo</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 14 }}>
        {loading ? (
             <View style={{ marginTop: 40, alignItems: 'center' }}>
                 <ActivityIndicator color={Colors.primary} size="large" />
                 <Text style={{ color: Colors.textMuted, marginTop: 10 }}>Cargando clientes...</Text>
             </View>
        ) : clientes.length === 0 ? (
            <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: 40 }}>No hay clientes registrados.</Text>
        ) : (
            clientes.map(c => {
              const estaActivo = c.membresia && c.membresia !== 'Inactiva' && c.membresia !== 'Ninguna';
              return (
                <TouchableOpacity key={c.id} style={styles.card} onPress={() => router.push(`/clientes/${c.id}`)}>
                  <View style={styles.row}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{c.nombre ? c.nombre[0] : 'U'}</Text></View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.name}>{c.nombre} {c.apellido}</Text>
                      <Text style={styles.sub}>{c.email || 'Sin correo'}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: estaActivo ? Colors.success : Colors.danger }]}>
                      <Text style={styles.badgeText}>{estaActivo ? 'Activa' : 'Vencida/Inactiva'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { color: Colors.primary, fontSize: 15 },
  title: { color: Colors.text, fontWeight: 'bold', fontSize: 16 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  addText: { color: Colors.black, fontWeight: '700', fontSize: 13 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.black, fontWeight: 'bold', fontSize: 18 },
  name: { color: Colors.text, fontWeight: '600', fontSize: 15 },
  sub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  badge: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
