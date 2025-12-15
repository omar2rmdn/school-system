import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const SupervisorHome = () => {
  return (
    <View style={styles.container}>
      <Text>Supervisor Home Screen</Text>
      <Link href="/supervisor/dashboard">Go to Dashboard</Link>
    </View>
  );
};

export default SupervisorHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
