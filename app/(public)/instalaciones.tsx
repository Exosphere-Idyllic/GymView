import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';

const GALLERY = [
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
  'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
];

export default function InstalacionesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>⬅ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuestras Instalaciones</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>
          Conoce el espacio diseñado para superar tus límites. Maquinaria de última generación y zonas especializadas para cada tipo de entrenamiento.
        </Text>

        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {GALLERY.map((url, i) => (
            <View key={i} style={[styles.imgWrap, isDesktop && styles.imgWrapDesktop]}>
              <Image source={{ uri: url }} style={styles.img} resizeMode="cover" />
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>¿Listo para empezar?</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(auth)/registro')}>
            <Text style={styles.ctaBtnText}>INSCRIBIRME AHORA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: 'rgba(18,18,18,0.95)',
  },
  backBtn: { padding: 8, paddingLeft: 0 },
  backBtnText: { color: Colors.textMuted, fontSize: 15, fontWeight: 'bold' },
  title: { color: Colors.primary, fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  scroll: { paddingBottom: 40 },
  subtitle: {
    color: '#adb5bd', fontSize: 16, textAlign: 'center',
    marginHorizontal: 30, marginVertical: 30, lineHeight: 24,
  },
  grid: { paddingHorizontal: 15, gap: 15 },
  gridDesktop: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  imgWrap: { width: '100%', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
  imgWrapDesktop: { width: '48%', maxWidth: 500 },
  img: { width: '100%', height: 300 },
  footer: {
    marginTop: 60, alignItems: 'center', padding: 30,
    backgroundColor: '#1a1a1a', borderTopWidth: 1, borderTopColor: '#333',
  },
  footerTitle: { color: Colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  ctaBtn: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30 },
  ctaBtnText: { color: Colors.black, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});
