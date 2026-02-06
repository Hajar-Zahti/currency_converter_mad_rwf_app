import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { API_URL } from "../../config/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const login = async () => {
        if (!email.trim() || !password.trim()) {
            return Alert.alert("Erreur", "Veuillez remplir tous les champs");
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || "Identifiants incorrects");
            }

            // Stocke le token
            await AsyncStorage.setItem("token", json.data.accessToken);

            // Redirige vers le dashboard
            Alert.alert("Succès", "Connexion réussie !");
            router.replace("/main/dashboard");
        } catch (error: any) {
            Alert.alert("Erreur", error.message || "Connexion échouée");
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
                {/* Header avec logo */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={["#1e90ff", "#4caf50"]}
                        style={styles.logoContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons
                            name="swap-horizontal"
                            size={40}
                            color="white"
                        />
                    </LinearGradient>
                    <Text style={styles.title}>Connexion</Text>
                    <Text style={styles.subtitle}>Accédez à votre compte</Text>
                </View>

                {/* Formulaire */}
                <View style={styles.formContainer}>
                    {/* Champ Email */}
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
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

                    {/* Champ Password */}
                    <View style={styles.inputContainer}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            placeholder="Mot de passe"
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={
                                    showPassword
                                        ? "eye-off-outline"
                                        : "eye-outline"
                                }
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Lien mot de passe oublié */}
                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>
                            Mot de passe oublié ?
                        </Text>
                    </TouchableOpacity>

                    {/* Bouton de connexion */}
                    <TouchableOpacity
                        style={[
                            styles.loginButton,
                            loading && styles.disabledButton,
                        ]}
                        onPress={login}
                        disabled={loading}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={["#1e90ff", "#0d7bd4"]}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="log-in-outline"
                                        size={20}
                                        color="white"
                                    />
                                    <Text style={styles.loginButtonText}>
                                        Se connecter
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Séparateur */}
                    <View style={styles.separator}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>OU</Text>
                        <View style={styles.separatorLine} />
                    </View>

                    {/* Lien vers l'inscription */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>
                            Pas encore de compte ?{" "}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push("/register")}
                        >
                            <Text style={styles.registerLink}>S'inscrire</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        En vous connectant, vous acceptez nos{" "}
                        <Text style={styles.footerLink}>
                            conditions d'utilisation
                        </Text>
                    </Text>
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
        justifyContent: "center",
        padding: 24,
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
        shadowColor: "#1e90ff",
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
        fontSize: 16,
        color: "#666",
        textAlign: "center",
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
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: "#1e90ff",
        fontSize: 14,
        fontWeight: "500",
    },
    loginButton: {
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#1e90ff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 24,
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
    loginButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 10,
    },
    separator: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e0e0e0",
    },
    separatorText: {
        marginHorizontal: 16,
        color: "#666",
        fontSize: 14,
    },
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    registerText: {
        color: "#666",
        fontSize: 15,
    },
    registerLink: {
        color: "#4caf50",
        fontSize: 15,
        fontWeight: "600",
    },
    footer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    footerText: {
        textAlign: "center",
        fontSize: 12,
        color: "#999",
        lineHeight: 18,
    },
    footerLink: {
        color: "#1e90ff",
        textDecorationLine: "underline",
    },
});
