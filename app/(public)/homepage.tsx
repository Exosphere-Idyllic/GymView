// app/(public)/homepage.tsx
// Convertido desde index.html (MathewLara) → React Native/Expo
// Responsive: Web Desktop + Mobile

import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Platform, Image, useWindowDimensions, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';

const isWeb = Platform.OS === 'web';

export default function Homepage() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 992;
    const isMobile = width < 768;
    const [navOpen, setNavOpen] = useState(false);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 0 }}
            showsVerticalScrollIndicator={false}
        >
            {/* ══════════════ NAVBAR ══════════════ */}
            <View style={styles.navbar}>
                <View style={[styles.navContainer, isDesktop && styles.navContainerDesktop]}>
                    {/* Brand */}
                    <View style={styles.brand}>
                        <Text style={styles.brandIcon}>⚡</Text>
                        <Text style={styles.brandText}>IRON FITNESS</Text>
                    </View>

                    {/* Desktop Nav */}
                    {isDesktop ? (
                        <View style={styles.navLinks}>
                            <TouchableOpacity><Text style={styles.navLink}>Inicio</Text></TouchableOpacity>
                            <TouchableOpacity><Text style={styles.navLink}>Instalaciones</Text></TouchableOpacity>
                            <TouchableOpacity><Text style={styles.navLink}>Planes</Text></TouchableOpacity>
                            <TouchableOpacity>
                                <Text style={[styles.navLink, { color: Colors.primary, fontWeight: 'bold' }]}>
                                    TIENDA
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.btnZonaSocios}
                                onPress={() => router.push('/(auth)/login')}
                            >
                                <Text style={styles.btnZonaSociosText}>👤 Zona de Socios</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setNavOpen(!navOpen)} style={styles.hamburger}>
                            <Text style={{ color: Colors.text, fontSize: 22 }}>☰</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Mobile Menu Dropdown */}
                {!isDesktop && navOpen && (
                    <View style={styles.mobileMenu}>
                        {['Inicio', 'Instalaciones', 'Planes', 'TIENDA'].map((item, i) => (
                            <TouchableOpacity key={i} style={styles.mobileMenuItem}>
                                <Text style={[styles.navLink, { paddingVertical: 10, fontSize: 15 }]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={[styles.btnZonaSocios, { marginTop: 8, alignSelf: 'flex-start' }]}
                            onPress={() => { setNavOpen(false); router.push('/(auth)/login'); }}
                        >
                            <Text style={styles.btnZonaSociosText}>👤 Zona de Socios</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* ══════════════ HERO SECTION ══════════════ */}
            <View style={[styles.hero, { height: isDesktop ? 600 : isMobile ? 380 : 500 }]}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                />
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                    <Text style={[styles.heroTitle, { fontSize: isDesktop ? 72 : isMobile ? 36 : 52 }]}>
                        ENTRENA{'\n'}SIN LÍMITES
                    </Text>
                    <Text style={[styles.heroSubtitle, { fontSize: isDesktop ? 20 : 15 }]}>
                        Maquinaria profesional, pesas libres y el mejor{'\n'}ambiente para superar tus metas.
                    </Text>
                    <TouchableOpacity style={[styles.heroCTA, isDesktop && { paddingVertical: 18, paddingHorizontal: 48 }]}>
                        <Text style={styles.heroCTAText}>INSCRÍBETE AHORA</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ══════════════ INSTALACIONES ══════════════ */}
            <View style={[styles.section, { backgroundColor: '#f8f9fa' }]}>
                <View style={[styles.sectionInner, isDesktop && styles.sectionInnerDesktop]}>
                    <Text style={[styles.sectionTitle, { color: '#212529' }]}>Nuestras Áreas</Text>
                    <Text style={[styles.sectionSubtitle, { color: '#6c757d' }]}>
                        Todo lo que necesitas para tu entrenamiento
                    </Text>

                    <View style={[styles.cardsGrid, isDesktop && styles.cardsGridDesktop]}>
                        {[
                            { icon: '🌪️', title: 'Zona de Peso Libre', desc: 'Mancuernas hasta 50kg, bancos olímpicos y jaulas de potencia para entrenar pesado.' },
                            { icon: '🚴', title: 'Cardio', desc: 'Cintas de correr, elípticas y bicicletas estáticas de última generación.' },
                            { icon: '⚡', title: 'Área Funcional', desc: 'Espacio dedicado para HIIT, calistenia, estiramientos y entrenamiento con TRX.' },
                        ].map((item, i) => (
                            <View key={i} style={[styles.featureCard, isDesktop && { flex: 1 }]}>
                                <Text style={styles.featureIcon}>{item.icon}</Text>
                                <Text style={[styles.featureTitle, { color: '#212529' }]}>{item.title}</Text>
                                <Text style={[styles.featureDesc, { color: '#6c757d' }]}>{item.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            {/* ══════════════ TIENDA SECTION ══════════════ */}
            <View style={[styles.section, { backgroundColor: '#000' }]}>
                <View style={[styles.sectionInner, isDesktop && styles.sectionInnerDesktop]}>
                    <View style={[styles.tiendaRow, isDesktop && { flexDirection: 'row', gap: 60 }]}>
                        {/* Text Side */}
                        <View style={[styles.tiendaText, isDesktop && { flex: 1 }]}>
                            <Text style={styles.tiendaEyebrow}>Iron Store</Text>
                            <Text style={[styles.tiendaHeadline, { fontSize: isDesktop ? 42 : 28 }]}>
                                Suplementación{'\n'}& Equipo
                            </Text>
                            <Text style={styles.tiendaDesc}>
                                Potencia tus resultados con nuestra selección premium de proteínas, creatina y accesorios. Calidad garantizada.
                            </Text>
                            {[
                                'Proteínas Whey & Isolatadas',
                                'Creatina Monohidratada',
                                'Accesorios de levantamiento',
                            ].map((f, i) => (
                                <Text key={i} style={styles.tiendaFeatureItem}>✅  {f}</Text>
                            ))}
                            <TouchableOpacity style={styles.tiendaBtn}>
                                <Text style={styles.tiendaBtnText}>IR A LA TIENDA →</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Images Side */}
                        <View style={[styles.tiendaImages, isDesktop && { flex: 1 }]}>
                            <View style={[styles.tiendaImgGrid, isDesktop && { flexDirection: 'row' }]}>
                                <View style={[styles.tiendaImgCard, isDesktop && { flex: 1 }]}>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                                        style={styles.tiendaImg}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.tiendaImgOverlay}>
                                        <Text style={styles.tiendaImgLabel}>Suplementos</Text>
                                        <Text style={styles.tiendaImgSub}>Combustible para tus músculos</Text>
                                    </View>
                                </View>
                                <View style={[styles.tiendaImgCard, isDesktop && { flex: 1 }]}>
                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                                        style={styles.tiendaImg}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.tiendaImgOverlay}>
                                        <Text style={styles.tiendaImgLabel}>Equipamiento</Text>
                                        <Text style={styles.tiendaImgSub}>Guantes, cinturones y más</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* ══════════════ PLANES ══════════════ */}
            <View style={[styles.section, { backgroundColor: Colors.background }]}>
                <View style={[styles.sectionInner, isDesktop && styles.sectionInnerDesktop]}>
                    <Text style={styles.sectionTitle}>Elige tu Plan</Text>
                    <Text style={styles.sectionSubtitle}>Sin contratos forzosos. Entrena a tu ritmo.</Text>

                    <View style={[styles.plansGrid, isDesktop && styles.plansGridDesktop]}>
                        {/* Plan Smart */}
                        <View style={[styles.planCard, isDesktop && { flex: 1, maxWidth: 380 }]}>
                            <View style={styles.planHeader}>
                                <Text style={styles.planName}>PLAN SMART</Text>
                                <View style={styles.planBadge}>
                                    <Text style={styles.planBadgeText}>Semicompleto</Text>
                                </View>
                            </View>
                            <View style={styles.planBody}>
                                <Text style={styles.planPrice}>
                                    $24.99<Text style={styles.planPeriod}>/mes</Text>
                                </Text>
                                <View style={styles.planFeaturesList}>
                                    {['Acceso ilimitado', 'Área de pesas', 'Vestidores y duchas'].map((f, i) => (
                                        <Text key={i} style={styles.planFeature}>✅  {f}</Text>
                                    ))}
                                </View>
                                <TouchableOpacity style={[styles.planBtn, { backgroundColor: '#212529' }]}>
                                    <Text style={[styles.planBtnText, { color: '#fff' }]}>Seleccionar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Plan Black */}
                        <View style={[styles.planCard, styles.planCardFeatured, isDesktop && { flex: 1, maxWidth: 380 }]}>
                            <View style={[styles.planHeader, styles.planHeaderFeatured]}>
                                <Text style={[styles.planName, { color: Colors.black }]}>PLAN BLACK</Text>
                                <View style={[styles.planBadge, { backgroundColor: Colors.black }]}>
                                    <Text style={[styles.planBadgeText, { color: Colors.primary }]}>Más Popular</Text>
                                </View>
                            </View>
                            <View style={styles.planBody}>
                                <Text style={styles.planPrice}>
                                    $34.99<Text style={styles.planPeriod}>/mes</Text>
                                </Text>
                                <View style={styles.planFeaturesList}>
                                    {['Todo el Plan Smart', 'Entrenador Personalizado', 'Acceso a todas las sedes', 'Camiseta de regalo'].map((f, i) => (
                                        <Text key={i} style={styles.planFeature}>✅  {f}</Text>
                                    ))}
                                </View>
                                <TouchableOpacity style={[styles.planBtn, { backgroundColor: '#212529' }]}>
                                    <Text style={[styles.planBtnText, { color: '#fff' }]}>Seleccionar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* ══════════════ FOOTER ══════════════ */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2026 Iron Fitness. Todos los derechos reservados.</Text>
                <Text style={styles.footerSub}>Av. Principal 123, Quito, Ecuador</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // Navbar
    navbar: {
        backgroundColor: 'rgba(18,18,18,0.97)',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingVertical: 14,
        position: isWeb ? ('sticky' as any) : 'relative',
        top: 0,
        zIndex: 100,
    },
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    navContainerDesktop: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    brand: { flexDirection: 'row', alignItems: 'center' },
    brandIcon: { fontSize: 22, color: Colors.primary, marginRight: 8 },
    brandText: { fontSize: 20, fontWeight: 'bold', color: Colors.primary, letterSpacing: 2 },
    navLinks: { flexDirection: 'row', alignItems: 'center', gap: 24 },
    navLink: { color: Colors.text, fontSize: 14, fontWeight: '500' },
    btnZonaSocios: {
        borderWidth: 2, borderColor: Colors.primary,
        borderRadius: 20, paddingVertical: 7, paddingHorizontal: 18,
    },
    btnZonaSociosText: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 },
    hamburger: { padding: 4 },
    mobileMenu: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    mobileMenuItem: { paddingVertical: 4 },

    // Hero
    hero: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    heroContent: { alignItems: 'center', paddingHorizontal: 24, zIndex: 1 },
    heroTitle: {
        fontWeight: 'bold', color: Colors.text, textAlign: 'center',
        marginBottom: 18, lineHeight: undefined,
    },
    heroSubtitle: { color: '#adb5bd', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
    heroCTA: {
        backgroundColor: Colors.primary,
        paddingVertical: 16, paddingHorizontal: 40,
        borderRadius: 6,
    },
    heroCTAText: { color: Colors.black, fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },

    // Sections
    section: { paddingVertical: 70 },
    sectionInner: { paddingHorizontal: 20 },
    sectionInnerDesktop: { maxWidth: 1200, alignSelf: 'center', width: '100%' },
    sectionTitle: {
        fontSize: 32, fontWeight: 'bold', color: Colors.text,
        textAlign: 'center', marginBottom: 10,
    },
    sectionSubtitle: {
        fontSize: 16, textAlign: 'center', marginBottom: 44,
    },

    // Feature cards
    cardsGrid: { gap: 20 },
    cardsGridDesktop: { flexDirection: 'row' },
    featureCard: {
        backgroundColor: '#fff', borderRadius: 12, padding: 28,
        alignItems: 'center', shadowColor: '#000',
        shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
        marginBottom: 16,
    },
    featureIcon: { fontSize: 52, marginBottom: 16 },
    featureTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    featureDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

    // Tienda
    tiendaRow: { gap: 30 },
    tiendaText: { paddingBottom: 20 },
    tiendaEyebrow: {
        color: Colors.primary, fontWeight: 'bold',
        fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
    },
    tiendaHeadline: { fontWeight: 'bold', color: Colors.text, marginBottom: 16, lineHeight: 48 },
    tiendaDesc: { color: '#adb5bd', fontSize: 15, lineHeight: 24, marginBottom: 20 },
    tiendaFeatureItem: { color: Colors.text, fontSize: 14, marginBottom: 10, lineHeight: 22 },
    tiendaBtn: {
        marginTop: 20, borderWidth: 2, borderColor: Colors.primary,
        borderRadius: 30, paddingVertical: 14, paddingHorizontal: 32,
        alignSelf: 'flex-start',
    },
    tiendaBtnText: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },
    tiendaImages: {},
    tiendaImgGrid: { gap: 16 },
    tiendaImgCard: {
        borderRadius: 12, overflow: 'hidden',
        borderWidth: 1, borderColor: '#333', marginBottom: 16,
    },
    tiendaImg: { width: '100%', height: 200 },
    tiendaImgOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 16,
    },
    tiendaImgLabel: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    tiendaImgSub: { color: '#adb5bd', fontSize: 12, marginTop: 4 },

    // Plans
    plansGrid: { gap: 20, alignItems: 'stretch' },
    plansGridDesktop: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
    planCard: {
        backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden',
        borderWidth: 1, borderColor: '#dee2e6',
    },
    planCardFeatured: { borderWidth: 3, borderColor: Colors.primary },
    planHeader: { backgroundColor: '#fff', padding: 24, alignItems: 'center' },
    planHeaderFeatured: { backgroundColor: Colors.primary },
    planName: { fontSize: 22, fontWeight: 'bold', color: '#212529', marginBottom: 8 },
    planBadge: {
        backgroundColor: '#6c757d', borderRadius: 12,
        paddingVertical: 4, paddingHorizontal: 14,
    },
    planBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    planBody: { padding: 24 },
    planPrice: { fontSize: 44, fontWeight: 'bold', color: '#212529', textAlign: 'center', marginBottom: 20 },
    planPeriod: { fontSize: 16, color: '#6c757d', fontWeight: 'normal' },
    planFeaturesList: { marginBottom: 20 },
    planFeature: { fontSize: 14, color: '#212529', marginBottom: 10, lineHeight: 22 },
    planBtn: {
        borderRadius: 30, paddingVertical: 14,
        alignItems: 'center', marginTop: 4,
    },
    planBtnText: { fontWeight: 'bold', fontSize: 15 },

    // Footer
    footer: {
        backgroundColor: '#000',
        paddingVertical: 30,
        alignItems: 'center',
    },
    footerText: { color: Colors.text, fontSize: 14, marginBottom: 4 },
    footerSub: { color: '#6c757d', fontSize: 12 },
});