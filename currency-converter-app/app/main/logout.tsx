import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Logout() {
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            "Déconnexion",
            "Êtes-vous sûr de vouloir vous déconnecter ?",
            [
                {
                    text: "Annuler",
                    style: "cancel"
                },
                {
                    text: "Déconnexion",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("token");
                            router.replace("/(auth)/login");
                        } catch (error) {
                            console.error("Logout error:", error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="log-out" size={80} color="#ff3b30" />
            </View>

            <Text style={styles.title}>Déconnexion</Text>

            <Text style={styles.message}>
                Vous êtes sur le point de vous déconnecter de votre compte.
                Vous devrez vous reconnecter pour accéder à vos données.
            </Text>

            <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color="#ff9500" />
                <Text style={styles.warningText}>
                    Toutes les données en cache seront conservées.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Se Déconnecter</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
            >
                <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        color: '#333',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
        marginBottom: 30,
        paddingHorizontal: 10,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff8e1',
        padding: 15,
        borderRadius: 10,
        marginBottom: 30,
        borderLeftWidth: 4,
        borderLeftColor: '#ff9500',
    },
    warningText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    logoutButton: {
        backgroundColor: '#ff3b30',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    cancelButton: {
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
    },
});
