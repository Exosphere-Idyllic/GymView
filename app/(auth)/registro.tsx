// app/(auth)/registro.tsx
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../src/theme/colors';

export default function RegistroScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Registro - Próximamente</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    text: { color: Colors.text, fontSize: 18 },
});