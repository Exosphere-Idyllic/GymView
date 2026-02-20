// app/entrenadores/index.tsx
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../src/theme/colors';

export default function EntrenadoresIndex() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Entrenadores - En desarrollo</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
    text: { color: Colors.text, fontSize: 18 },
});