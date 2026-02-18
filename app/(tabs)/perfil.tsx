import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../src/store/AuthContext';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas salir?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Salir',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.label}>Usuario:</Text>
                <Text style={styles.value}>{user?.usuario}</Text>

                <Text style={styles.label}>Nombre:</Text>
                <Text style={styles.value}>{user?.nombre_completo}</Text>

                <Text style={styles.label}>Rol:</Text>
                <Text style={styles.value}>{user?.rol}</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginTop: 12,
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});