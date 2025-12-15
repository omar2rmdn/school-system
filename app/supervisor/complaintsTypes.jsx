import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SupervisorComplaintsTypes = () => {
  // Pre-define navigation handlers
  const navigateToReceived = () => {
    router.push("/supervisor/recievedComplaints");
  };

  const navigateToSend = () => {
    router.push("/supervisor/sendComplaint");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={navigateToReceived}
      >
        <Text style={styles.cardText}>Received Complaints</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={navigateToSend}
      >
        <Text style={styles.cardText}>Send a Complaint</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SupervisorComplaintsTypes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    gap: 20,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  card: {
    // width: "80%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    // alignItems: "center",
  },
  cardText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
});
