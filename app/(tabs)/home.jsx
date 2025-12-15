import { MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import HomeCarousel from "../../components/HomeCarousel";
import { useAuth } from "../../context/AuthContext";

const HomeScreen = () => {
  const { user } = useAuth();
  const isParent = user?.roles.includes("Parent");
  const isAdmin = user?.roles.includes("Admin");
  const isTeacher = user?.roles.includes("Teacher");
  const isSupervisor = user?.roles.includes("Supervisor");

  const handleDashboardPress = () => {
    if (isAdmin) {
      router.push("/(admin)");
    } else if (isTeacher) {
      router.push("/teacher");
    } else if (isSupervisor) {
      router.push("/supervisor/dashboard");
    }
  };

  return (
    <View style={styles.container}>
      <HomeCarousel />

      {/* Cards Container */}
      <View
        style={
          isParent ? styles.cardsContainer : styles.cardsContainerNonParent
        }
      >
        {isParent ? (
          <>
            {/* First Row - About Us and Our News */}
            <View style={styles.cardRow}>
              <Pressable
                onPress={() => router.push("/(sub-screens)/about")}
                style={[styles.card, { width: "48%" }]}
              >
                <Text>
                  <Entypo name="info-with-circle" size={40} color="#007BFF" />
                </Text>
                <Text style={styles.cardText}>About Us</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/(sub-screens)/news")}
                style={[styles.card, { width: "48%" }]}
              >
                <Text>
                  <MaterialIcons name="article" size={40} color="#007BFF" />
                </Text>
                <Text style={styles.cardText}>Our News</Text>
              </Pressable>
            </View>

            {/* Second Row - Activities (full width) */}
            <View style={styles.cardRow}>
              <Pressable
                onPress={() => router.push("/(sub-screens)/activities")}
                style={[styles.card, { width: "100%" }]}
              >
                <Text>
                  <MaterialCommunityIcons
                    name="police-badge"
                    size={40}
                    color="#007BFF"
                  />
                </Text>
                <Text style={styles.cardText}>Activities</Text>
              </Pressable>
            </View>
          </>
        ) : (
          // Dashboard button for non-parent roles
          <View style={styles.cardRow}>
            <Pressable
              onPress={handleDashboardPress}
              style={[styles.card, { width: "100%" }]}
            >
              <Text>
                <MaterialCommunityIcons
                  name="view-dashboard"
                  size={40}
                  color="#007BFF"
                />
              </Text>
              <Text style={styles.cardText}>Dashboard</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
    alignItems: "center",
  },
  cardsContainer: {
    position: "absolute",
    bottom: 120,
    width: "100%",
  },
  cardsContainerNonParent: {
    position: "absolute",
    bottom: 250, // Reduced from 120 to 20 to eliminate space
    width: "100%",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
