// app/catalogo/index.tsx
// Conversión exacta de catalogo.html de MathewLara
// Catálogo de productos con carrito de compras y API real

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, ActivityIndicator, SafeAreaView, useWindowDimensions,
    Modal, FlatList, Alert, TextInput, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../src/theme/colors';
import ventasService from '../../src/services/ventas.service';
import productosService from '../../src/services/productos.service';
import { useAuth } from '../../src/store/AuthContext';

// ── Tipos ──────────────────────────────────────────────────────────────────────
interface Producto {
    idProducto?: number;
    id?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    tipo: 'venta' | 'uso';
    stock_actual?: number;
}

interface CartItem {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    imagenUrl: string;
}

type FiltroCategoria = 'todos' | 'venta' | 'uso';

// ── Componente Principal ───────────────────────────────────────────────────────
export default function CatalogoScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 992;
    const isTablet  = width >= 640;

    const [productos, setProductos] = useState<Producto[]>([]);
    const [filtrados, setFiltrados] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<FiltroCategoria>('todos');
    const [carrito, setCarrito] = useState<CartItem[]>([]);
    const [carritoVisible, setCarritoVisible] = useState(false);
    const [procesandoPago, setProcesandoPago] = useState(false);

    // ── Cargar productos desde API ─────────────────────────────────────────────
    const cargarProductos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productosService.listar();
            setProductos(data);
            setFiltrados(data);
        } catch (e: any) {
            setError(e.message || 'No se pudo cargar el catálogo');
            // Mock productos para demo
            const mock: Producto[] = [
                { idProducto: 1, nombre: 'Proteína Whey Gold', descripcion: 'Proteína de suero de leche premium, 2kg. Aumenta tu masa muscular con la mejor calidad.', precio: 49.99, tipo: 'venta' },
                { idProducto: 2, nombre: 'Creatina Monohidratada', descripcion: 'Creatina pura de alta pureza, 500g. Mejora tu rendimiento y fuerza en cada entreno.', precio: 24.99, tipo: 'venta' },
                { idProducto: 3, nombre: 'Guantes de Entrenamiento', descripcion: 'Guantes de cuero sintético con muñequera reforzada. Talla M/L/XL disponibles.', precio: 19.99, tipo: 'venta' },
                { idProducto: 4, nombre: 'Cinturón Lumbar', descripcion: 'Protección lumbar profesional para levantamiento de pesas. Cuero genuino.', precio: 34.99, tipo: 'venta' },
                { idProducto: 5, nombre: 'Barra Olímpica 20kg', descripcion: 'Barra olímpica profesional de acero cromado. Uso exclusivo en instalaciones.', precio: 0, tipo: 'uso' },
                { idProducto: 6, nombre: 'Mancuernas Hex (par)', descripcion: 'Mancuernas hexagonales de goma, disponibles de 5kg a 50kg. Uso en gimnasio.', precio: 0, tipo: 'uso' },
            ];
            setProductos(mock);
            setFiltrados(mock);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargarProductos(); }, [cargarProductos]);

    // ── Filtrar ────────────────────────────────────────────────────────────────
    const aplicarFiltro = (cat: FiltroCategoria) => {
        setFiltro(cat);
        if (cat === 'todos') setFiltrados(productos);
        else setFiltrados(productos.filter(p => p.tipo === cat));
    };

    // ── Carrito ────────────────────────────────────────────────────────────────
    const getId = (p: Producto) => p.idProducto ?? p.id ?? 0;

    const agregarAlCarrito = (producto: Producto) => {
        const id = getId(producto);
        const imagenUrl = productosService.getImagenUrl(id);

        setCarrito(prev => {
            const idx = prev.findIndex(i => i.id === id);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = { ...updated[idx], cantidad: updated[idx].cantidad + 1 };
                return updated;
            }
            return [...prev, { id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, imagenUrl }];
        });

        Alert.alert('✅ Carrito', `${producto.nombre} agregado al carrito.`);
    };

    const eliminarDelCarrito = (id: number) => {
        setCarrito(prev => prev.filter(i => i.id !== id));
    };

    const vaciarCarrito = () => {
        Alert.alert('Vaciar carrito', '¿Estás seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Vaciar', style: 'destructive', onPress: () => setCarrito([]) },
        ]);
    };

    const totalCarrito = carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);
    const countCarrito  = carrito.reduce((t, i) => t + i.cantidad, 0);

    // ── Procesar pago ──────────────────────────────────────────────────────────
    const procesarPago = async () => {
        if (carrito.length === 0) return;
        setProcesandoPago(true);
        try {
            await ventasService.procesar({
                idUsuario: user?.id_usuario ?? 0,
                total: totalCarrito,
                productos: carrito.map(i => ({ id: i.id, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad })),
            });
            setCarrito([]);
            setCarritoVisible(false);
            Alert.alert('✅ ¡Pedido confirmado!', 'Tu factura ha sido generada en el sistema.');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'El servidor rechazó la venta.');
        } finally {
            setProcesandoPago(false);
        }
    };

    // ── Columnas según ancho ───────────────────────────────────────────────────
    const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;
    const cardWidth  = isDesktop ? (width - 80) / 3 - 16 : isTablet ? (width - 60) / 2 - 12 : width - 40;

    return (
        <SafeAreaView style={styles.safe}>

            {/* ── Navbar ── */}
            <View style={styles.navbar}>
                <View style={styles.navInner}>
                    <View style={styles.brand}>
                        <Text style={styles.brandIcon}>⚡</Text>
                        <Text style={styles.brandText}>Iron Fitness</Text>
                    </View>
                    <View style={styles.navRight}>
                        {Platform.OS === 'web' && (
                            <>
                                <TouchableOpacity onPress={() => router.push('/(public)/homepage')}>
                                    <Text style={styles.navLink}>Inicio</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                    <Text style={[styles.navLink, { color: Colors.primary, fontWeight: 'bold' }]}>Zona Socios</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {/* Botón carrito */}
                        <TouchableOpacity style={styles.cartBtn} onPress={() => setCarritoVisible(true)}>
                            <Text style={styles.cartIcon}>🛒</Text>
                            {countCarrito > 0 && (
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>{countCarrito}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* ── Header sección ── */}
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Nuestro Catálogo</Text>
                        <Text style={styles.sectionSub}>Explora nuestros productos y equipamiento.</Text>
                    </View>
                </View>

                {/* ── Filtros ── */}
                <View style={styles.filtros}>
                    {(['todos', 'venta', 'uso'] as FiltroCategoria[]).map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.filtroBtn, filtro === cat && styles.filtroBtnActive]}
                            onPress={() => aplicarFiltro(cat)}
                        >
                            <Text style={[styles.filtroBtnText, filtro === cat && styles.filtroBtnTextActive]}>
                                {cat === 'todos' ? 'Todos' : cat === 'venta' ? 'Tienda' : 'Equipamiento'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Loading / Error ── */}
                {loading && (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Cargando catálogo...</Text>
                    </View>
                )}

                {!loading && error && (
                    <View style={styles.warnBox}>
                        <Text style={styles.warnText}>⚠️ {error} — Mostrando catálogo de ejemplo</Text>
                    </View>
                )}

                {/* ── Grid de productos ── */}
                {!loading && (
                    <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
                        {filtrados.map(producto => {
                            const id = getId(producto);
                            const isVenta = producto.tipo === 'venta';
                            return (
                                <View key={id} style={[styles.productCard, { width: cardWidth }]}>
                                    {/* Imagen */}
                                    <Image
                                        source={{ uri: productosService.getImagenUrl(id) }}
                                        style={styles.productImg}
                                        defaultSource={{ uri: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80' }}
                                    />
                                    {/* Body */}
                                    <View style={styles.productBody}>
                                        {/* Badge */}
                                        <View style={[styles.badge, { backgroundColor: isVenta ? Colors.primary : '#444' }]}>
                                            <Text style={[styles.badgeText, { color: isVenta ? Colors.black : Colors.text }]}>
                                                {isVenta ? 'Tienda' : 'Uso Interno'}
                                            </Text>
                                        </View>
                                        <Text style={styles.productName}>{producto.nombre}</Text>
                                        <Text style={styles.productDesc}>{producto.descripcion}</Text>

                                        {/* Acción */}
                                        {isVenta ? (
                                            <View style={styles.productFooter}>
                                                <Text style={styles.productPrice}>${producto.precio.toFixed(2)}</Text>
                                                <TouchableOpacity
                                                    style={styles.addBtn}
                                                    onPress={() => agregarAlCarrito(producto)}
                                                >
                                                    <Text style={styles.addBtnText}>🛒 Agregar</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View style={styles.usoInfo}>
                                                <Text style={styles.usoText}>ℹ️ Solo disponible en gimnasio</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* ── Volver ── */}
                <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                    <Text style={styles.backLinkText}>← Volver</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* ════════════════════════════════════
                MODAL CARRITO DE COMPRAS
            ════════════════════════════════════ */}
            <Modal visible={carritoVisible} animationType="slide" transparent onRequestClose={() => setCarritoVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, isDesktop && styles.modalCardDesktop]}>

                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🛍️ Tu Pedido</Text>
                            <TouchableOpacity onPress={() => setCarritoVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Items */}
                        <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 10 }}>
                            {carrito.length === 0 ? (
                                <View style={styles.cartEmpty}>
                                    <Text style={{ fontSize: 48, marginBottom: 10 }}>🛒</Text>
                                    <Text style={styles.cartEmptyText}>Tu carrito está vacío.</Text>
                                    <TouchableOpacity onPress={() => setCarritoVisible(false)}>
                                        <Text style={{ color: Colors.primary, marginTop: 10 }}>Ir a comprar</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                carrito.map(item => (
                                    <View key={item.id} style={styles.cartItem}>
                                        <Image source={{ uri: item.imagenUrl }} style={styles.cartItemImg}
                                               defaultSource={{ uri: 'https://via.placeholder.com/50' }} />
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <Text style={styles.cartItemName}>{item.nombre}</Text>
                                            <Text style={styles.cartItemPrice}>${item.precio.toFixed(2)} x {item.cantidad}</Text>
                                        </View>
                                        <View style={styles.cartItemRight}>
                                            <Text style={styles.cartItemSubtotal}>${(item.precio * item.cantidad).toFixed(2)}</Text>
                                            <TouchableOpacity onPress={() => eliminarDelCarrito(item.id)} style={styles.cartRemoveBtn}>
                                                <Text style={styles.cartRemoveText}>🗑️</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        {/* Footer */}
                        {carrito.length > 0 && (
                            <View style={styles.modalFooter}>
                                <View>
                                    <Text style={styles.totalLabel}>Total Estimado</Text>
                                    <Text style={styles.totalAmount}>${totalCarrito.toFixed(2)}</Text>
                                </View>
                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={styles.vaciarBtn} onPress={vaciarCarrito}>
                                        <Text style={styles.vaciarBtnText}>Vaciar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.pagarBtn, procesandoPago && styles.pagarBtnDisabled]}
                                        onPress={procesarPago}
                                        disabled={procesandoPago}
                                    >
                                        {procesandoPago
                                            ? <ActivityIndicator color={Colors.black} size="small" />
                                            : <Text style={styles.pagarBtnText}>CONFIRMAR PEDIDO →</Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:           { flex: 1, backgroundColor: Colors.background },
    container:      { flex: 1 },

    // Navbar
    navbar:         { backgroundColor: 'rgba(18,18,18,0.97)', borderBottomWidth: 1, borderBottomColor: '#333', paddingVertical: 14 },
    navInner:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, maxWidth: 1200, alignSelf: 'center', width: '100%' },
    brand:          { flexDirection: 'row', alignItems: 'center' },
    brandIcon:      { fontSize: 22, color: Colors.primary, marginRight: 6 },
    brandText:      { color: Colors.primary, fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
    navRight:       { flexDirection: 'row', alignItems: 'center', gap: 20 },
    navLink:        { color: Colors.text, fontSize: 14, fontWeight: '500' },
    cartBtn:        { position: 'relative', padding: 6 },
    cartIcon:       { fontSize: 24 },
    cartBadge:      { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.danger, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
    cartBadgeText:  { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    // Sección header
    sectionHeader:  { padding: 20, paddingBottom: 4, maxWidth: 1200, width: '100%', alignSelf: 'center' },
    sectionTitle:   { color: Colors.text, fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
    sectionSub:     { color: Colors.textMuted, fontSize: 14 },

    // Filtros
    filtros:        { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, gap: 10, maxWidth: 1200, width: '100%', alignSelf: 'center' },
    filtroBtn:      { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#2c2c2c', borderWidth: 1, borderColor: '#444' },
    filtroBtnActive:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
    filtroBtnText:  { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
    filtroBtnTextActive: { color: Colors.black },

    // Grid
    grid:           { padding: 20, gap: 16, maxWidth: 1200, width: '100%', alignSelf: 'center' },
    gridDesktop:    { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },

    // Tarjeta producto
    productCard:    { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
    productImg:     { width: '100%', height: 200, backgroundColor: '#111' },
    productBody:    { padding: 16 },
    badge:          { alignSelf: 'flex-start', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 10, marginBottom: 8 },
    badgeText:      { fontSize: 11, fontWeight: '700' },
    productName:    { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
    productDesc:    { color: Colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 12 },
    productFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    productPrice:   { color: Colors.primary, fontSize: 22, fontWeight: 'bold' },
    addBtn:         { backgroundColor: Colors.primary, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
    addBtnText:     { color: Colors.black, fontWeight: '700', fontSize: 13 },
    usoInfo:        { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
    usoText:        { color: Colors.textMuted, fontSize: 12 },

    // Misc
    centered:       { alignItems: 'center', paddingVertical: 40 },
    loadingText:    { color: Colors.textMuted, marginTop: 12 },
    warnBox:        { margin: 20, backgroundColor: '#2d1a00', borderLeftWidth: 3, borderLeftColor: Colors.warning, borderRadius: 8, padding: 12 },
    warnText:       { color: Colors.warning, fontSize: 12 },
    backLink:       { padding: 20, alignItems: 'center' },
    backLinkText:   { color: Colors.textMuted, fontSize: 14 },

    // Modal carrito
    modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
    modalCard:      { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
    modalCardDesktop: { maxWidth: 600, alignSelf: 'center', width: '100%', borderRadius: 20, marginBottom: 40 },
    modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: '#000', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalTitle:     { color: Colors.primary, fontWeight: 'bold', fontSize: 18 },
    modalClose:     { color: Colors.text, fontSize: 20 },
    modalBody:      { padding: 16, maxHeight: 350 },
    cartEmpty:      { alignItems: 'center', paddingVertical: 30 },
    cartEmptyText:  { color: Colors.textMuted, fontSize: 15 },
    cartItem:       { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 12 },
    cartItemImg:    { width: 50, height: 50, borderRadius: 8, backgroundColor: '#333' },
    cartItemName:   { color: Colors.text, fontWeight: '600', fontSize: 14 },
    cartItemPrice:  { color: Colors.primary, fontSize: 12, marginTop: 2 },
    cartItemRight:  { alignItems: 'flex-end' },
    cartItemSubtotal: { color: Colors.text, fontWeight: 'bold', marginBottom: 4 },
    cartRemoveBtn:  { padding: 4 },
    cartRemoveText: { fontSize: 16 },
    modalFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: '#000', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    totalLabel:     { color: Colors.textMuted, fontSize: 12 },
    totalAmount:    { color: Colors.text, fontWeight: 'bold', fontSize: 22 },
    modalActions:   { flexDirection: 'row', gap: 10 },
    vaciarBtn:      { borderWidth: 1, borderColor: '#555', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
    vaciarBtnText:  { color: Colors.textMuted, fontWeight: '600' },
    pagarBtn:       { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
    pagarBtnDisabled: { backgroundColor: '#555' },
    pagarBtnText:   { color: Colors.black, fontWeight: '800', fontSize: 13 },
});