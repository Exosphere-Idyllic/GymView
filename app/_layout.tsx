// app/_layout.tsx
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/store/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="clientes" options={{ headerShown: false }} />
                <Stack.Screen name="entrenadores" options={{ headerShown: false }} />
            </Stack>
        </AuthProvider>
    );
}