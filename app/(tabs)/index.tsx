import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../src/store/AuthContext';

export default function DashboardScreen() {
    const { user } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🏋️ Bienvenido a GymView</Text>
            <Text style={styles.subtitle}>Usuario: {user?.usuario}</Text>
            <Text style={styles.subtitle}>Rol: {user?.rol}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
});