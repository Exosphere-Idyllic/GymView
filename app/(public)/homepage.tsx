// app/(public)/homepage.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';

export default function Homepage() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Navbar */}
            <View style={styles.navbar}>
                <View style={styles.navContainer}>
                    <View style={styles.brand}>
                        <Text style={styles.brandIcon}>⚡</Text>
                        <Text style={styles.brandText}>IRON FITNESS</Text>
                    </View>
                    <View style={styles.navLinks}>
                        <TouchableOpacity><Text style={styles.navLink}>Inicio</Text></TouchableOpacity>
                        <TouchableOpacity><Text style={styles.navLink}>Instalaciones</Text></TouchableOpacity>
                        <TouchableOpacity><Text style={styles.navLink}>Planes</Text></TouchableOpacity>
                        <TouchableOpacity
                            style={styles.btnZonaSocios}
                            onPress={() => router.push('/(auth)/login')}
                        >
                            <Text style={styles.btnZonaSociosText}>👤 Zona de Socios</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Hero Section */}
            <View style={styles.hero}>
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                    <Text style={styles.heroTitle}>ENTRENA SIN LÍMITES</Text>
                    <Text style={styles.heroSubtitle}>
                        Maquinaria profesional, pesas libres y el mejor ambiente para superar tus metas.
                    </Text>
                    <TouchableOpacity style={styles.heroCTA}>
                        <Text style={styles.heroCTAText}>INSCRÍBETE AHORA</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Instalaciones */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nuestras Áreas</Text>
                <Text style={styles.sectionSubtitle}>Todo lo que necesitas para tu entrenamiento</Text>

                <View style={styles.grid}>
                    {[
                        { icon: '🏋️', title: 'Zona de Peso Libre', desc: 'Mancuernas hasta 50kg, bancos olímpicos y jaulas de potencia.' },
                        { icon: '🚴', title: 'Cardio', desc: 'Cintas de correr, elípticas y bicicletas de última generación.' },
                        { icon: '⚡', title: 'Área Funcional', desc: 'Espacio para HIIT, calistenia y entrenamiento con TRX.' },
                    ].map((item, i) => (
                        <View key={i} style={styles.featureCard}>
                            <Text style={styles.featureIcon}>{item.icon}</Text>
                            <Text style={styles.featureTitle}>{item.title}</Text>
                            <Text style={styles.featureDesc}>{item.desc}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Planes */}
            <View style={[styles.section, styles.sectionDark]}>
                <Text style={styles.sectionTitle}>Elige tu Plan</Text>
                <Text style={styles.sectionSubtitle}>Sin contratos forzosos. Entrena a tu ritmo.</Text>

                <View style={styles.plansGrid}>
                    {/* Plan Smart */}
                    <View style={styles.planCard}>
                        <View style={styles.planHeader}>
                            <Text style={styles.planName}>PLAN SMART</Text>
                            <Text style={styles.planBadge}>Semicompleto</Text>
                        </View>
                        <View style={styles.planBody}>
                            <Text style={styles.planPrice}>$24.99<Text style={styles.planPeriod}>/mes</Text></Text>
                            <View style={styles.planFeatures}>
                                <Text style={styles.planFeature}>✅ Acceso ilimitado</Text>
                                <Text style={styles.planFeature}>✅ Área de pesas</Text>
                                <Text style={styles.planFeature}>✅ Vestidores y duchas</Text>
                            </View>
                            <TouchableOpacity style={styles.planBtn}>
                                <Text style={styles.planBtnText}>Seleccionar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Plan Black */}
                    <View style={[styles.planCard, styles.planCardFeatured]}>
                        <View style={[styles.planHeader, styles.planHeaderFeatured]}>
                            <Text style={[styles.planName, { color: Colors.black }]}>PLAN BLACK</Text>
                            <Text style={[styles.planBadge, { backgroundColor: Colors.black, color: Colors.primary }]}>Más Popular</Text>
                        </View>
                        <View style={styles.planBody}>
                            <Text style={styles.planPrice}>$34.99<Text style={styles.planPeriod}>/mes</Text></Text>
                            <View style={styles.planFeatures}>
                                <Text style={styles.planFeature}>✅ Todo el Plan Smart</Text>
                                <Text style={styles.planFeature}>✅ Entrenador Personalizado</Text>
                                <Text style={styles.planFeature}>✅ Acceso a todas las sedes</Text>
                                <Text style={styles.planFeature}>✅ Camiseta de regalo</Text>
                            </View>
                            <TouchableOpacity style={styles.planBtn}>
                                <Text style={styles.planBtnText}>Seleccionar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2026 Iron Fitness. Todos los derechos reservados.</Text>
                <Text style={styles.footerSubText}>Av. Principal 123, Quito, Ecuador</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Navbar
    navbar: {
        backgroundColor: 'rgba(18, 18, 18, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingVertical: 15,
    },
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    brand: { flexDirection: 'row', alignItems: 'center' },
    brandIcon: { fontSize: 24, marginRight: 8, color: Colors.primary },
    brandText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: 1,
    },
    navLinks: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    navLink: { color: Colors.text, fontSize: 14, fontWeight: '500' },
    btnZonaSocios: {
        borderWidth: 2,
        borderColor: Colors.primary,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    btnZonaSociosText: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 },

    // Hero
    hero: {
        height: Platform.OS === 'web' ? 500 : 400,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    heroContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 1,
    },
    heroTitle: {
        fontSize: Platform.OS === 'web' ? 64 : 40,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: Platform.OS === 'web' ? 18 : 16,
        color: Colors.textMuted,
        marginBottom: 32,
        textAlign: 'center',
        maxWidth: 600,
    },
    heroCTA: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 8,
    },
    heroCTAText: {
        color: Colors.black,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },

    // Sections
    section: {
        paddingVertical: 60,
        paddingHorizontal: 20,
        maxWidth: 1200,
        width: '100%',
        alignSelf: 'center',
    },
    sectionDark: { backgroundColor: Colors.surfaceAlt },
    sectionTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: 40,
    },

    // Features Grid
    grid: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        gap: 20,
    },
    featureCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    featureIcon: { fontSize: 48, marginBottom: 16 },
    featureTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    featureDesc: {
        fontSize: 14,
        color: Colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
    },

    // Plans
    plansGrid: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        gap: 20,
        justifyContent: 'center',
    },
    planCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        width: Platform.OS === 'web' ? 320 : '100%',
    },
    planCardFeatured: {
        borderWidth: 3,
        borderColor: Colors.primary,
    },
    planHeader: {
        backgroundColor: Colors.surface,
        padding: 20,
        alignItems: 'center',
    },
    planHeaderFeatured: { backgroundColor: Colors.primary },
    planName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    planBadge: {
        backgroundColor: '#666',
        color: Colors.text,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        fontSize: 11,
        fontWeight: '600',
    },
    planBody: { padding: 20 },
    planPrice: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 20,
    },
    planPeriod: { fontSize: 16, color: Colors.textMuted },
    planFeatures: { marginBottom: 20 },
    planFeature: {
        color: Colors.text,
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    planBtn: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
    },
    planBtnText: {
        color: Colors.black,
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Footer
    footer: {
        backgroundColor: '#000',
        paddingVertical: 30,
        alignItems: 'center',
    },
    footerText: { color: Colors.text, fontSize: 14, marginBottom: 4 },
    footerSubText: { color: Colors.textMuted, fontSize: 12 },
});