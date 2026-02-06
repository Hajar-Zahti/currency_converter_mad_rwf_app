import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config/api';

export default function Convert() {
    const [amount, setAmount] = useState("");
    const [result, setResult] = useState<number | null>(null);
    const [conversionType, setConversionType] = useState<'MAD_TO_RWF' | 'RWF_TO_MAD'>('MAD_TO_RWF');
    const [loading, setLoading] = useState(false);

    const handleConvert = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return Alert.alert("Erreur", "Veuillez entrer un montant valide");
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                return Alert.alert("Erreur", "Session expirée, veuillez vous reconnecter");
            }

            const res = await fetch(
                `${API_URL}/transactions/convert?type=${conversionType}&amount=${numAmount}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Erreur de conversion");
            }

            setResult(data.finalAmount);
            setAmount("");
            Alert.alert("Succès", "Conversion effectuée avec succès");

        } catch (error: any) {
            Alert.alert("Erreur", error.message || "Conversion échouée");
            console.error("Conversion error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrencySymbol = () => {
        return conversionType === 'MAD_TO_RWF' ? 'MAD' : 'RWF';
    };

    const getTargetCurrency = () => {
        return conversionType === 'MAD_TO_RWF' ? 'RWF' : 'MAD';
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Conversion de Devises</Text>
                <Text style={styles.subtitle}>Convertir entre MAD et RWF</Text>
            </View>

            <View style={styles.card}>
                {/* Sélection du type de conversion */}
                <Text style={styles.label}>Type de conversion</Text>
                <View style={styles.typeContainer}>
                    <Pressable
                        style={[
                            styles.typeButton,
                            conversionType === 'MAD_TO_RWF' && styles.activeTypeButton
                        ]}
                        onPress={() => setConversionType('MAD_TO_RWF')}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            conversionType === 'MAD_TO_RWF' && styles.activeTypeButtonText
                        ]}>
                            MAD
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.typeButton,
                            conversionType === 'RWF_TO_MAD' && styles.activeTypeButton
                        ]}
                        onPress={() => setConversionType('RWF_TO_MAD')}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            conversionType === 'RWF_TO_MAD' && styles.activeTypeButtonText
                        ]}>
                            RWF 
                        </Text>
                    </Pressable>
                </View>

                {/* Champ de saisie */}
                <Text style={styles.label}>Montant à convertir ({getCurrencySymbol()})</Text>
                <TextInput
                    style={styles.input}
                    placeholder={`Entrez le montant en ${getCurrencySymbol()}`}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    editable={!loading}
                />

                {/* Bouton de conversion */}
                <Pressable
                    style={[styles.convertButton, loading && styles.disabledButton]}
                    onPress={handleConvert}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.convertButtonText}>
                            Convertir en {getTargetCurrency()}
                        </Text>
                    )}
                </Pressable>

                {/* Résultat */}
                {result !== null && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultLabel}>Montant converti:</Text>
                        <Text style={styles.resultAmount}>
                            {result.toFixed(2)} {getTargetCurrency()}
                        </Text>
                    </View>
                )}

                {/* Info taux */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Information</Text>
                    <Text style={styles.infoText}>
                        Le taux de conversion est actualisé quotidiennement.
                        Les frais de conversion sappliquent selon les conditions générales.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        backgroundColor: '#1e90ff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    card: {
        margin: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    typeContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10,
    },
    typeButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    activeTypeButton: {
        backgroundColor: '#1e90ff',
        borderColor: '#1e90ff',
    },
    typeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    activeTypeButtonText: {
        color: '#fff',
    },
    input: {
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    convertButton: {
        backgroundColor: '#1e90ff',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    disabledButton: {
        opacity: 0.7,
    },
    convertButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    resultContainer: {
        backgroundColor: '#f0f8ff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    resultLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    resultAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e90ff',
    },
    infoBox: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#1e90ff',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
});
