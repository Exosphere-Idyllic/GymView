// app/clientes/index.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import { MOCK_CLIENTES } from '../../src/services/mock/mockData';

export default function ClientesIndex() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Volver</Text></TouchableOpacity>
        <Text style={styles.title}>Gestión de Clientes</Text>
        <TouchableOpacity onPress={() => router.push('/clientes/crear')} style={styles.addBtn}><Text style={styles.addText}>+ Nuevo</Text></TouchableOpacity>
      </View>
      <ScrollView style={{ padding: 14 }}>
        {MOCK_CLIENTES.map(c => (
          <TouchableOpacity key={c.id_cliente} style={styles.card} onPress={() => router.push(`/clientes/${c.id_cliente}`)}>
            <View style={styles.row}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{c.nombre[0]}</Text></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{c.nombre} {c.apellido}</Text>
                <Text style={styles.sub}>{c.email}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: c.estadoMembresia === 'Activa' ? Colors.success : Colors.danger }]}>
                <Text style={styles.badgeText}>{c.estadoMembresia}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
