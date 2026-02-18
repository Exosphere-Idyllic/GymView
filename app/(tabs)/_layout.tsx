import { Tabs } from 'expo-router';
import { useAuth } from '../../src/store/AuthContext';

export default function TabsLayout() {
    const { user } = useAuth();

    return (
        <Tabs screenOptions={{ headerShown: true }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: () => '🏠',
                }}
            />

            {(user?.rol === 'recepcionista' || user?.rol === 'admin') && (
                <Tabs.Screen
                    name="asistencia"
                    options={{
                        title: 'Asistencia',
                        tabBarIcon: () => '📱',
                    }}
                />
            )}

            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Perfil',
                    tabBarIcon: () => '👤',
                }}
            />
        </Tabs>
    );
}