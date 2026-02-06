import { API_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function Deposit() {
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState<"MAD" | "RWF">("MAD");
    const [loading, setLoading] = useState(false);

    const handleDeposit = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return Alert.alert("Erreur", "Veuillez entrer un montant valide");
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                return Alert.alert(
                    "Erreur",
                    "Session expirée, veuillez vous reconnecter",
                );
            }

            const res = await fetch(`${API_URL}/transactions/deposit`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: numAmount,
                    currency: currency,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Dépôt échoué");
            }

            setAmount("");
            Alert.alert(
                "Succès",
                `Dépôt de ${numAmount} ${currency} effectué avec succès`,
                [{ text: "OK" }],
            );
        } catch (error: any) {
            Alert.alert("Erreur", error.message || "Dépôt échoué");
            console.error("Deposit error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Dépôt de Fonds</Text>
                <Text style={styles.subtitle}>
                    Ajoutez des fonds à votre compte
                </Text>
            </View>

            <View style={styles.card}>
                {/* Sélection de la devise */}
                <Text style={styles.label}>Devise du dépôt</Text>
                <View style={styles.currencyContainer}>
                    <Pressable
                        style={[
                            styles.currencyButton,
                            currency === "MAD" && styles.activeCurrencyButton,
                        ]}
                        onPress={() => setCurrency("MAD")}
                    >
                        <Text
                            style={[
                                styles.currencyButtonText,
                                currency === "MAD" &&
                                    styles.activeCurrencyButtonText,
                            ]}
                        >
                            MAD (Dirham Marocain)
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.currencyButton,
                            currency === "RWF" && styles.activeCurrencyButton,
                        ]}
                        onPress={() => setCurrency("RWF")}
                    >
                        <Text
                            style={[
                                styles.currencyButtonText,
                                currency === "RWF" &&
                                    styles.activeCurrencyButtonText,
                            ]}
                        >
                            RWF (Franc Rwandais)
                        </Text>
                    </Pressable>
                </View>

                {/* Montant */}
                <Text style={styles.label}>Montant à déposer ({currency})</Text>
                <TextInput
                    style={styles.input}
                    placeholder={`Entrez le montant en ${currency}`}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    editable={!loading}
                />

                {/* Bouton de dépôt */}
                <Pressable
                    style={[
                        styles.depositButton,
                        loading && styles.disabledButton,
                    ]}
                    onPress={handleDeposit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.depositButtonText}>
                            Effectuer le Dépôt
                        </Text>
                    )}
                </Pressable>

                {/* Info */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Conditions de dépôt</Text>
                    <Text style={styles.infoText}>
                        • Montant minimum: 100 {currency}
                        {"\n"}• Les fonds sont crédités sous 24h{"\n"}• Aucun
                        frais pour les dépôts par Mobile Money{"\n"}• Contactez
                        le support pour les gros montants
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        padding: 20,
        backgroundColor: "#34c759",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
    },
    card: {
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
        color: "#333",
    },
    currencyContainer: {
        marginBottom: 20,
    },
    currencyButton: {
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#ddd",
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
    },
    activeCurrencyButton: {
        backgroundColor: "#34c759",
        borderColor: "#34c759",
    },
    currencyButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        textAlign: "center",
    },
    activeCurrencyButtonText: {
        color: "#fff",
    },
    input: {
        borderWidth: 2,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: "#f9f9f9",
    },
    paymentMethodsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 20,
    },
    paymentMethodButton: {
        flex: 1,
        minWidth: "45%",
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#ddd",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },
    selectedPaymentMethod: {
        backgroundColor: "#34c759",
        borderColor: "#34c759",
    },
    paymentMethodIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    paymentMethodText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
        textAlign: "center",
    },
    depositButton: {
        backgroundColor: "#34c759",
        padding: 18,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 20,
    },
    disabledButton: {
        opacity: 0.7,
    },
    depositButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    infoBox: {
        backgroundColor: "#f0f9f0",
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#34c759",
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 5,
        color: "#333",
    },
    infoText: {
        fontSize: 12,
        color: "#666",
        lineHeight: 18,
    },
});
