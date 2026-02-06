import { useState, useEffect } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { API_URL } from "@/config/api";

export default function ResetPassword() {
    const params = useLocalSearchParams();
    const token = params.token as string;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    // Vérifier le token au chargement
    useEffect(() => {
        if (token) {
            verifyToken(token);
        }
    }, [token]);

    const verifyToken = async (tokenToVerify: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/verify-token`, {
                headers: {
                    "Authorization": `Bearer ${tokenToVerify}`,
                    "Content-Type": "application/json"
                },
            });

            const data = await response.json();
            setTokenValid(response.ok);

            if (!response.ok) {
                Alert.alert("Lien expiré", "Ce lien de réinitialisation a expiré ou est invalide.");
            }
        } catch (error) {
            setTokenValid(false);
            Alert.alert("Erreur", "Impossible de vérifier le lien");
        }
    };

    const handleResetPassword = async () => {
        // Validation
        if (!newPassword.trim() || !confirmPassword.trim()) {
            return Alert.alert("Erreur", "Veuillez remplir tous les champs");
        }

        if (newPassword.length < 6) {
            return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
        }

        if (newPassword !== confirmPassword) {
            return Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
        }

        if (!token) {
            return Alert.alert("Erreur", "Lien de réinitialisation invalide");
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la réinitialisation");
            }

            Alert.alert(
                "Succès",
                "Votre mot de passe a été réinitialisé avec succès !",
                [
                    {
                        text: "Se connecter",
                        onPress: () => router.replace("/(auth)/login")
                    }
                ]
            );

        } catch (error: any) {
            Alert.alert("Erreur", error.message || "Impossible de réinitialiser le mot de passe");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (tokenValid === false) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="warning" size={60} color="#ff6b6b" />
                    <Text style={styles.errorTitle}>Lien invalide</Text>
                    <Text style={styles.errorText}>
                        Ce lien de réinitialisation a expiré ou est incorrect.
                    </Text>
                    <TouchableOpacity
                        style={styles.errorButton}
                        onPress={() => router.push("/(auth)/forgot-password")}
                    >
                        <Text style={styles.errorButtonText}>Nouvelle demande</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

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
                        <Ionicons name="lock-open" size={40} color="white" />
                    </LinearGradient>

                    <Text style={styles.title}>Nouveau mot de passe</Text>
                    <Text style={styles.subtitle}>
                        Créez un nouveau mot de passe sécurisé
                    </Text>
                </View>

                {/* Formulaire */}
                <View style={styles.formContainer}>
                    {/* Nouveau mot de passe */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Nouveau mot de passe (min. 6 caractères)"
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirmation */}
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Confirmer le mot de passe"
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Indicateur de correspondance */}
                    {newPassword.length > 0 && confirmPassword.length > 0 && (
                        <View style={[
                            styles.matchIndicator,
                            {
                                backgroundColor: newPassword === confirmPassword ? '#e8f5e9' : '#ffebee',
                                borderColor: newPassword === confirmPassword ? '#4caf50' : '#ff6b6b'
                            }
                        ]}>
                            <Ionicons
                                name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"}
                                size={16}
                                color={newPassword === confirmPassword ? '#4caf50' : '#ff6b6b'}
                            />
                            <Text style={[
                                styles.matchText,
                                { color: newPassword === confirmPassword ? '#4caf50' : '#ff6b6b' }
                            ]}>
                                {newPassword === confirmPassword ? "Les mots de passe correspondent" : "Les mots de passe ne correspondent pas"}
                            </Text>
                        </View>
                    )}

                    {/* Indicateur de force */}
                    {newPassword.length > 0 && (
                        <View style={styles.passwordStrength}>
                            <Text style={styles.strengthLabel}>Force du mot de passe:</Text>
                            <View style={styles.strengthBars}>
                                {[1, 2, 3, 4].map((index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.strengthBar,
                                            {
                                                backgroundColor: getStrengthColor(newPassword.length, index)
                                            }
                                        ]}
                                    />
                                ))}
                            </View>
                            <Text style={styles.strengthText}>
                                {getStrengthText(newPassword.length)}
                            </Text>
                        </View>
                    )}

                    {/* Bouton de réinitialisation */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleResetPassword}
                        disabled={loading || !tokenValid}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#4caf50', '#2e7d32']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                                    <Text style={styles.submitButtonText}>
                                        Réinitialiser le mot de passe
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Conseils de sécurité */}
                <View style={styles.securityTips}>
                    <Text style={styles.tipsTitle}>💡 Conseils de sécurité :</Text>
                    <Text style={styles.tip}>• Utilisez au moins 6 caractères</Text>
                    <Text style={styles.tip}>• Combinez lettres, chiffres et symboles</Text>
                    <Text style={styles.tip}>• Évitez les mots de passe courants</Text>
                    <Text style={styles.tip}>• Ne réutilisez pas d'anciens mots de passe</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// Fonctions d'aide pour la force du mot de passe
const getStrengthColor = (passwordLength: number, index: number): string => {
    const strengthLevels = [
        { min: 0, colors: ['#ff6b6b', '#ff6b6b', '#e0e0e0', '#e0e0e0'] },
        { min: 3, colors: ['#ff9500', '#ff9500', '#e0e0e0', '#e0e0e0'] },
        { min: 6, colors: ['#ffd700', '#ffd700', '#ffd700', '#e0e0e0'] },
        { min: 8, colors: ['#4caf50', '#4caf50', '#4caf50', '#4caf50'] }
    ];

    const level = strengthLevels.find(level => passwordLength >= level.min) || strengthLevels[0];
    return level.colors[index - 1] || '#e0e0e0';
};

const getStrengthText = (passwordLength: number): string => {
    if (passwordLength < 3) return "Très faible";
    if (passwordLength < 6) return "Faible";
    if (passwordLength < 8) return "Moyen";
    return "Fort";
};

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
        shadowColor: '#4caf50',
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
        marginBottom: 16,
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
    eyeIcon: {
        padding: 8,
    },
    matchIndicator: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 16,
    },
    matchText: {
        marginLeft: 8,
        fontSize: 13,
        fontWeight: "500",
    },
    passwordStrength: {
        marginBottom: 20,
    },
    strengthLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    strengthBars: {
        flexDirection: "row",
        gap: 4,
        marginBottom: 4,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    strengthText: {
        fontSize: 12,
        color: "#999",
        textAlign: "right",
    },
    submitButton: {
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: '#4caf50',
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
    securityTips: {
        backgroundColor: "#f0f9ff",
        padding: 16,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#1e90ff",
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    tip: {
        fontSize: 13,
        color: "#555",
        marginBottom: 4,
        lineHeight: 18,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ff6b6b",
        marginTop: 20,
        marginBottom: 10,
    },
    errorText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 30,
    },
    errorButton: {
        backgroundColor: "#1e90ff",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
    },
    errorButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});
