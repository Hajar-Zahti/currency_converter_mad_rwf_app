import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { API_URL } from "@/config/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"request" | "reset" | "success">("request");

    const handleRequestReset = async () => {
        if (!email.trim()) {
            return Alert.alert("Erreur", "Veuillez entrer votre adresse email");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Alert.alert("Erreur", "Veuillez entrer un email valide");
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/request-password-reset?email=${encodeURIComponent(email)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la demande");
            }

            Alert.alert(
                "Email envoyé",
                "Un lien de réinitialisation a été envoyé à votre adresse email.",
                [
                    {
                        text: "OK",
                        onPress: () => setStep("reset")
                    }
                ]
            );

        } catch (error: any) {
            Alert.alert("Erreur", error.message || "Impossible d'envoyer l'email");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#666" />
                    </TouchableOpacity>

                    <LinearGradient
                        colors={['#1e90ff', '#4caf50']}
                        style={styles.logoContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="key" size={40} color="white" />
                    </LinearGradient>

                    <Text style={styles.title}>Mot de passe oublié</Text>
                    <Text style={styles.subtitle}>
                        {step === "request"
                            ? "Entrez votre email pour recevoir un lien de réinitialisation"
                            : "Vérifiez votre boîte mail pour continuer"}
                    </Text>
                </View>

                {/* Formulaire */}
                <View style={styles.formContainer}>
                    {step === "request" ? (
                        <>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Adresse email"
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.submitButton, loading && styles.disabledButton]}
                                onPress={handleRequestReset}
                                disabled={loading}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#1e90ff', '#0d7bd4']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Ionicons name="paper-plane-outline" size={20} color="white" />
                                            <Text style={styles.submitButtonText}>
                                                Envoyer le lien
                                            </Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.successContainer}>
                            <Ionicons name="checkmark-circle" size={60} color="#4caf50" />
                            <Text style={styles.successTitle}>Email envoyé !</Text>
                            <Text style={styles.successText}>
                                Vérifiez votre boîte de réception ({email}) pour le lien de réinitialisation.
                            </Text>

                            <Text style={styles.noteText}>
                                💡 Le lien expire généralement après 24 heures.
                            </Text>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={() => setStep("request")}
                                >
                                    <Ionicons name="refresh-outline" size={18} color="#1e90ff" />
                                    <Text style={styles.secondaryButtonText}>Renvoyer</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={() => router.push("/(auth)/login")}
                                >
                                    <Ionicons name="log-in-outline" size={18} color="white" />
                                    <Text style={styles.primaryButtonText}>Retour connexion</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Instructions */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#1e90ff" />
                        <Text style={styles.infoText}>
                            Si vous ne recevez pas l'email, vérifiez votre dossier spam ou contactez le support.
                        </Text>
                    </View>
                </View>

                {/* Lien vers la connexion */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Vous vous souvenez ? </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                        <Text style={styles.loginLink}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
    },
    backButton: {
        alignSelf: "flex-start",
        padding: 8,
        marginBottom: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: '#1e90ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1a365d",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    formContainer: {
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        backgroundColor: "#f8fafc",
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: "#333",
    },
    submitButton: {
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: '#1e90ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 20,
    },
    buttonGradient: {
        paddingVertical: 18,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 10,
    },
    successContainer: {
        alignItems: "center",
        padding: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#4caf50",
        marginTop: 15,
        marginBottom: 10,
    },
    successText: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 20,
    },
    noteText: {
        fontSize: 13,
        color: "#999",
        textAlign: "center",
        fontStyle: "italic",
        marginBottom: 30,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        gap: 10,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#1e90ff",
        borderRadius: 10,
        padding: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    primaryButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#f0f8ff",
        borderRadius: 10,
        padding: 15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#1e90ff",
    },
    secondaryButtonText: {
        color: "#1e90ff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f8ff",
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: "#1e90ff",
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 13,
        color: "#555",
        lineHeight: 18,
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
    },
    loginText: {
        color: "#666",
        fontSize: 15,
    },
    loginLink: {
        color: "#1e90ff",
        fontSize: 15,
        fontWeight: "600",
    },
});
