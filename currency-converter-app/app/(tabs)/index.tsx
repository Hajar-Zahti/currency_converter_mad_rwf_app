import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function Welcome() {
  return (
    <View style={styles.container}>

      {/* Logo et Titre */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="swap-horizontal" size={50} color="#1e90ff" />
        </View>
        <Text style={styles.title}>MAD ⇄ RWF</Text>
        <Text style={styles.subtitle}>Convertisseur de Devises</Text>
      </View>

      {/* Points forts */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <Ionicons name="shield-checkmark" size={20} color="#4caf50" />
          <Text style={styles.featureText}>Transactions sécurisées</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="refresh" size={20} color="#1e90ff" />
          <Text style={styles.featureText}>Taux en temps réel</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="document-text" size={20} color="#ff9500" />
          <Text style={styles.featureText}>Traçabilité complète</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Convertissez facilement entre le Dirham Marocain (MAD) et le Franc Rwandais (RWF) avec notre application mobile.
      </Text>

      {/* Boutons */}
      <View style={styles.buttons}>
        <Pressable
          style={styles.buttonPrimary}
          onPress={() => router.push("/login")}
        >
          <Ionicons name="log-in" size={18} color="white" />
          <Text style={styles.buttonPrimaryText}>Connexion</Text>
        </Pressable>
      </View>



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#e6f2ff",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1a365d",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  features: {
    marginBottom: 30,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#444",
  },
  description: {
    textAlign: "center",
    fontSize: 15,
    color: "#555",
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  buttons: {
    marginBottom: 20,
  },
  buttonPrimary: {
    backgroundColor: "#1e90ff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1e90ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonSecondary: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1e90ff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: "#1e90ff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  link: {
    color: "#1e90ff",
    fontWeight: "600",
  },
});
