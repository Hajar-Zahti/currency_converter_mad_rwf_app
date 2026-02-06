import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    RefreshControl
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config/api";

// Types
type IconName =
    | "swap-horizontal"
    | "wallet"
    | "list"
    | "log-out"
    | "home"
    | "trending-up"
    | "cash"
    | "person";

type MenuItem = {
    title: string;
    description: string;
    icon: IconName;
    screen: "convert" | "deposit" | "transactions" | "logout";
    color: string;
};

type UserStats = {
    totalConversions: number;
    totalDeposits: number;
    madBalance: number;
    rwfBalance: number;
    lastConversionDate: string | null;
    lastDepositDate: string | null;
};

export default function Dashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<UserStats>({
        totalConversions: 0,
        totalDeposits: 0,
        madBalance: 0,
        rwfBalance: 0,
        lastConversionDate: null,
        lastDepositDate: null
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userName, setUserName] = useState<string>("");

    const menuItems: MenuItem[] = [
        {
            title: "Conversion",
            description: "Convertir entre MAD et RWF",
            icon: "swap-horizontal",
            screen: "convert",
            color: "#1e90ff",
        },
        {
            title: "Dépôt",
            description: "Déposer des fonds",
            icon: "wallet",
            screen: "deposit",
            color: "#34c759",
        },
        {
            title: "Transactions",
            description: "Voir l'historique",
            icon: "list",
            screen: "transactions",
            color: "#ff9500",
        },
        {
            title: "Déconnexion",
            description: "Quitter l'application",
            icon: "log-out",
            screen: "logout",
            color: "#ff3b30",
        },
    ];

    // Fonction pour récupérer les statistiques
    const fetchUserStats = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                router.replace("/(auth)/login");
                return;
            }

            // Récupérer les transactions pour calculer les stats
            const transactionsRes = await fetch(`${API_URL}/transactions/my`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (transactionsRes.ok) {
                const transactions = await transactionsRes.json();

                // Calculer les statistiques
                let conversions = 0;
                let deposits = 0;
                let madBalance = 0;
                let rwfBalance = 0;
                let lastConversionDate: string | null = null;
                let lastDepositDate: string | null = null;

                transactions.forEach((transaction: any) => {
                    // Compter les conversions
                    if (transaction.type === 'MAD_TO_RWF' || transaction.type === 'RWF_TO_MAD') {
                        conversions++;
                        if (!lastConversionDate || new Date(transaction.createdAt) > new Date(lastConversionDate)) {
                            lastConversionDate = transaction.createdAt;
                        }

                        // Calculer les soldes (simplifié)
                        if (transaction.type === 'MAD_TO_RWF') {
                            madBalance -= transaction.amount;
                            rwfBalance += transaction.finalAmount;
                        } else if (transaction.type === 'RWF_TO_MAD') {
                            rwfBalance -= transaction.amount;
                            madBalance += transaction.finalAmount;
                        }
                    }

                    // Compter les dépôts
                    if (transaction.type === 'DEPOSIT_MAD' || transaction.type === 'DEPOSIT_RWF') {
                        deposits++;
                        if (!lastDepositDate || new Date(transaction.createdAt) > new Date(lastDepositDate)) {
                            lastDepositDate = transaction.createdAt;
                        }

                        // Ajouter au solde
                        if (transaction.type === 'DEPOSIT_MAD') {
                            madBalance += transaction.amount;
                        } else if (transaction.type === 'DEPOSIT_RWF') {
                            rwfBalance += transaction.amount;
                        }
                    }
                });

                setStats({
                    totalConversions: conversions,
                    totalDeposits: deposits,
                    madBalance: Math.max(0, madBalance),
                    rwfBalance: Math.max(0, rwfBalance),
                    lastConversionDate,
                    lastDepositDate
                });
            }

        } catch (error) {
            console.error("Erreur lors du chargement des stats:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fonction pour formater la date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Jamais";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Charger les données au démarrage
    useEffect(() => {
        fetchUserStats();
    }, []);

    const handleNavigation = (screen: MenuItem["screen"]) => {
        switch (screen) {
            case "convert":
                router.push("/main/convert");
                break;
            case "deposit":
                router.push("/main/deposit");
                break;
            case "transactions":
                router.push("/main/transactions");
                break;
            case "logout":
                router.push("/main/logout");
                break;
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserStats();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1e90ff" />
                <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#1e90ff"]}
                    tintColor="#1e90ff"
                />
            }
        >
            {/* En-tête avec informations utilisateur */}
            <View style={styles.header}>
                <Text style={styles.title}>Tableau de Bord</Text>
                <Text style={styles.subtitle}>
                    Gérez vos conversions et transactions
                </Text>
            </View>

            {/* Cartes de navigation */}
            <View style={styles.grid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => handleNavigation(item.screen)}
                    >
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: item.color + "20" },
                            ]}
                        >
                            <Ionicons
                                name={item.icon}
                                size={30}
                                color={item.color}
                            />
                        </View>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardDescription}>
                            {item.description}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Statistiques */}
            <View style={styles.statsContainer}>
                <View style={styles.statsHeader}>
                    <Text style={styles.sectionTitle}>Statistiques Rapides</Text>
                    <TouchableOpacity onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color="#1e90ff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    {/* Conversions */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#e6f2ff' }]}>
                            <Ionicons name="swap-horizontal" size={24} color="#1e90ff" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalConversions}</Text>
                        <Text style={styles.statLabel}>Conversions</Text>
                        <Text style={styles.statSubText}>
                            Dernière: {formatDate(stats.lastConversionDate)}
                        </Text>
                    </View>

                    {/* Dépôts */}
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#e8f5e9' }]}>
                            <Ionicons name="cash" size={24} color="#34c759" />
                        </View>
                        <Text style={styles.statValue}>{stats.totalDeposits}</Text>
                        <Text style={styles.statLabel}>Dépôts</Text>
                        <Text style={styles.statSubText}>
                            Dernier: {formatDate(stats.lastDepositDate)}
                        </Text>
                    </View>
                </View>

                {/* Soldes */}
                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceTitle}>Vos Soldes</Text>
                    <View style={styles.balanceGrid}>
                        <View style={styles.balanceCard}>
                            <View style={styles.currencyHeader}>
                                <View style={[styles.currencyIcon, { backgroundColor: '#1e90ff' }]}>
                                    <Text style={styles.currencyText}>MAD</Text>
                                </View>
                                <Text style={styles.balanceAmount}>
                                    {stats.madBalance.toFixed(2)}
                                </Text>
                            </View>
                            <Text style={styles.balanceLabel}>Dirham Marocain</Text>
                        </View>

                        <View style={styles.balanceCard}>
                            <View style={styles.currencyHeader}>
                                <View style={[styles.currencyIcon, { backgroundColor: '#34c759' }]}>
                                    <Text style={styles.currencyText}>RWF</Text>
                                </View>
                                <Text style={styles.balanceAmount}>
                                    {stats.rwfBalance.toFixed(2)}
                                </Text>
                            </View>
                            <Text style={styles.balanceLabel}>Franc Rwandais</Text>
                        </View>
                    </View>
                </View>

                {/* Actions rapides */}

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    loadingText: {
        marginTop: 10,
        color: "#666",
        fontSize: 14,
    },
    header: {
        padding: 20,
        backgroundColor: "#1e90ff",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    welcomeText: {
        fontSize: 14,
        color: "rgba(255,255,255,0.9)",
    },
    userName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.8)",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 10,
        justifyContent: "space-between",
    },
    card: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 5,
        textAlign: "center",
        color: "#333",
    },
    cardDescription: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
    statsContainer: {
        padding: 20,
    },
    statsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },
    statCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    statIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginVertical: 5,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 5,
    },
    statSubText: {
        fontSize: 11,
        color: "#999",
        textAlign: "center",
    },
    balanceContainer: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    balanceTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 15,
    },
    balanceGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    balanceCard: {
        width: "48%",
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        padding: 15,
    },
    currencyHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    currencyIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    currencyText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 12,
    },
    balanceAmount: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    balanceLabel: {
        fontSize: 12,
        color: "#666",
    },
    quickActions: {
        marginBottom: 20,
    },
    actionsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    actionButton: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    actionText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
});
