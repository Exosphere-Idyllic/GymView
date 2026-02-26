// app/+not-found.tsx
// Vista 404 – Conversión exacta de 404.html | Iron Fitness
// Responsive: Web (desktop) y Mobile (app)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../src/theme/colors';

export default function NotFoundScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    return (
        <View style={styles.container}>
            <Text style={[styles.title, isDesktop && styles.titleDesktop]}>
                Página no encontrada
            </Text>
            <Text style={[styles.message, isDesktop && styles.messageDesktop]}>
                Lo sentimos, pero la página que intentas ver no existe.
            </Text>
            <View style={styles.spacer} />
            <TouchableOpacity
                style={[styles.link, isDesktop && styles.linkDesktop]}
                onPress={() => router.replace('/')}
                activeOpacity={0.8}
            >
                <Text style={styles.linkText}>Volver al inicio</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: 24,
    },
    title: {
        color: '#555',
        fontSize: 24,
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: 12,
    },
    titleDesktop: {
        fontSize: 28,
    },
    message: {
        color: Colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 280,
    },
    messageDesktop: {
        fontSize: 16,
        maxWidth: 360,
    },
    spacer: {
        height: 24,
    },
    link: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    linkDesktop: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    linkText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});
