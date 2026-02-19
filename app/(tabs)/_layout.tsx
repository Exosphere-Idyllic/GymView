// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useAuth } from '../../src/store/AuthContext';
import Colors from '../../src/theme/colors';
import { Text } from 'react-native';

function TabIcon({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}

export default function TabsLayout() {
  const { user } = useAuth();
  const rol = user?.rol;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border, borderTopWidth: 1 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      {/* Dashboard - todos los roles */}
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: () => <TabIcon icon="🏠" /> }}
      />

      {/* Asistencia QR - recepcionista y admin */}
      <Tabs.Screen
        name="asistencia"
        options={{
          title: 'Asistencia',
          tabBarIcon: () => <TabIcon icon="📷" />,
          href: (rol === 'admin' || rol === 'recepcionista') ? undefined : null,
        }}
      />

      {/* Rutinas - entrenador y cliente */}
      <Tabs.Screen
        name="rutinas"
        options={{
          title: 'Rutinas',
          tabBarIcon: () => <TabIcon icon="🏋️" />,
          href: (rol === 'entrenador' || rol === 'cliente') ? undefined : null,
        }}
      />

      {/* Perfil - todos */}
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: () => <TabIcon icon="👤" /> }}
      />
    </Tabs>
  );
}
