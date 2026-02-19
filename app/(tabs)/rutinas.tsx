// app/(tabs)/rutinas.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../src/store/AuthContext';
import Colors from '../../src/theme/colors';

// Las rutinas se muestran directamente en los dashboards por rol
// Este tab es un redirector visual
export default function RutinasScreen() {
  const { user } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🏋️</Text>
      <Text style={styles.title}>Rutinas</Text>
      <Text style={styles.sub}>
        {user?.rol === 'entrenador'
          ? 'Gestiona rutinas desde la pestaña Inicio → Biblioteca'
          : 'Consulta tu entrenamiento desde la pestaña Inicio → Mi Entrenamiento'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { color: Colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  sub: { color: Colors.textMuted, textAlign: 'center', fontSize: 15, lineHeight: 22 },
});
