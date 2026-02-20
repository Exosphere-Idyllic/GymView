// app/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, Platform, Text, StyleSheet } from 'react-native';
import { useAuth } from '../src/store/AuthContext';
import Colors from '../src/theme/colors';

export default function Index() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Mostrar splash por 1 segundo solo en web
        if (Platform.OS === 'web') {
            setTimeout(() => setShowSplash(false), 1000);
        } else {
            setShowSplash(false);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && !showSplash) {
            if (isAuthenticated) {
                router.replace('/(tabs)');
            } else {
                router.replace('/(auth)/login');
            }
        }
    }, [isLoading, isAuthenticated, showSplash]);

    if (showSplash && Platform.OS === 'web') {
        return (
            <View style={styles.splashContainer}>
                <Text style={styles.logo}>⚡</Text>
                <Text style={styles.brandName}>IRON FITNESS</Text>
                <Text style={styles.tagline}>Sistema de Gestión de Gimnasio</Text>
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 30 }} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    logo: {
        fontSize: 120,
        marginBottom: 20,
    },
    brandName: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: 4,
        marginBottom: 10,
    },
    tagline: {
        fontSize: 16,
        color: Colors.textMuted,
        textAlign: 'center',
    },
});