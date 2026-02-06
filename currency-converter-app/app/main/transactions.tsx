import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { API_URL } from "../../config/api";

type Transaction = {
    id: number;
    transactionRef: string;
    type: string;
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
    finalAmount: number;
    status: string;
    createdAt: string;
};

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // Fonction pour formater la date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (error) {
            return dateString;
        }
    };

    // Fonction pour formater le type de transaction
    const formatTransactionType = (type: string) => {
        const typeMap: Record<string, string> = {
            MAD_TO_RWF: "MAD - RWF",
            RWF_TO_MAD: "RWF - MAD",
            DEPOSIT_MAD: "Dépôt MAD",
            DEPOSIT_RWF: "Dépôt RWF",
        };
        return typeMap[type] || type;
    };

    // Fonction pour formater le montant
    const formatAmount = (amount: number, currency?: string) => {
        return `${amount.toFixed(2)} ${currency || ""}`.trim();
    };

    // ===============================
    // DOWNLOAD EXCEL
    // ===============================
    const exportTransactions = async () => {
        try {
            setDownloading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token)
                return Alert.alert("Erreur", "Utilisateur non connecté");

            const url = `${API_URL}/transactions/my/export`;
            const fileName = `transactions_${Date.now()}.xlsx`;
            const fileUri = FileSystem.documentDirectory + fileName;

            const downloadResumable = FileSystem.createDownloadResumable(
                url,
                fileUri,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    },
                },
            );

            const downloadResult = await downloadResumable.downloadAsync();

            if (!downloadResult || !downloadResult.uri) {
                return Alert.alert(
                    "Erreur",
                    "Impossible de télécharger le fichier",
                );
            }

            // Vérifier si le fichier a été créé
            const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
            if (!fileInfo.exists) {
                return Alert.alert("Erreur", "Le fichier n'a pas été créé");
            }

            // Partager le fichier
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(downloadResult.uri, {
                    mimeType:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    dialogTitle: "Exporter mes transactions",
                    UTI: "com.microsoft.excel.xlsx",
                });
            } else {
                Alert.alert("Succès", `Fichier téléchargé: ${fileName}`);
            }
        } catch (error) {
            console.log("Export error:", error);
            Alert.alert("Erreur", "Impossible d'exporter les transactions");
        } finally {
            setDownloading(false);
        }
    };

    // ===============================
    // FETCH TRANSACTIONS
    // ===============================
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            if (!token)
                return Alert.alert("Erreur", "Utilisateur non connecté");

            const res = await fetch(`${API_URL}/transactions/my`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            console.log("Données reçues:", data); // Pour debug

            if (!res.ok) {
                return Alert.alert("Erreur", data.message || "Erreur serveur");
            }

            // Vérifier que data est un tableau
            if (Array.isArray(data)) {
                setTransactions(data);
            } else if (data.data && Array.isArray(data.data)) {
                // Si l'API retourne { data: [...] }
                setTransactions(data.data);
            } else {
                console.error("Format de données inattendu:", data);
                setTransactions([]);
            }
        } catch (error) {
            console.log("Fetch error:", error);
            Alert.alert("Erreur", "Connexion serveur échouée");
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    if (loading)
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#1e90ff" />
                <Text style={styles.loadingText}>
                    Chargement des transactions...
                </Text>
            </View>
        );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mes Transactions</Text>

            {/* Statistiques */}
            {transactions.length > 0 && (
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>
                        {transactions.length} transaction
                        {transactions.length > 1 ? "s" : ""}
                    </Text>
                </View>
            )}

            {/* TABLE HEADER */}
            <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, { flex: 1.5 }]}>
                    Date & Heure
                </Text>
                <Text style={styles.headerCell}>Type</Text>
                <Text style={styles.headerCell}>Montant</Text>
                <Text style={styles.headerCell}>Final</Text>
            </View>

            {/* TABLE BODY */}
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.row,
                            item.status === "COMPLETED"
                                ? styles.completedRow
                                : item.status === "PENDING"
                                  ? styles.pendingRow
                                  : styles.row,
                        ]}
                    >
                        <Text style={[styles.cell, { flex: 1.5 }]}>
                            {formatDate(item.createdAt)}
                        </Text>
                        <Text style={styles.cell}>
                            {formatTransactionType(item.type)}
                        </Text>
                        <Text style={styles.cell}>
                            {formatAmount(item.amount, item.fromCurrency)}
                        </Text>
                        <Text style={styles.cell}>
                            {formatAmount(item.finalAmount, item.toCurrency)}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune transaction</Text>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={fetchTransactions}
                        >
                            <Text style={styles.refreshButtonText}>
                                Rafraîchir
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
                refreshing={loading}
                onRefresh={fetchTransactions}
            />

            {/* Boutons */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.refreshButton]}
                    onPress={fetchTransactions}
                >
                    <Text style={styles.buttonText}>Actualiser</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.exportButton]}
                    onPress={exportTransactions}
                    disabled={downloading || transactions.length === 0}
                >
                    <Text style={styles.buttonText}>
                        {downloading
                            ? "Téléchargement..."
                            : `Exporter (${transactions.length})`}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        color: "#666",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        color: "#1a365d",
    },
    statsContainer: {
        backgroundColor: "#e6f2ff",
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: "center",
    },
    statsText: {
        color: "#1e90ff",
        fontWeight: "600",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#1e90ff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 5,
    },
    headerCell: {
        flex: 1,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 14,
    },
    row: {
        flexDirection: "row",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "white",
    },
    completedRow: {
        backgroundColor: "#f0f9f0",
    },
    pendingRow: {
        backgroundColor: "#fff8e1",
    },
    cell: {
        flex: 1,
        textAlign: "center",
        fontSize: 13,
        color: "#333",
    },
    emptyContainer: {
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 15,
    },
    refreshButton: {
        backgroundColor: "#4caf50",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6,
    },
    refreshButtonText: {
        color: "white",
        fontWeight: "600",
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        gap: 10,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    exportButton: {
        backgroundColor: "#1e90ff",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});
