import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAdminData } from "../../context/AdminDataContext";

const AdminDashboard = () => {
  const { counts, loading, refreshing, error, refreshAllData } = useAdminData();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="alert-circle" size={48} color="#DC3545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshAllData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dashboardItems = [
    {
      title: "Classes",
      count: counts.classes,
      icon: "school",
      color: "#007BFF",
      bgColor: "#E3F2FD",
    },
    {
      title: "Teachers",
      count: counts.teachers,
      icon: "person-circle",
      color: "#28A745",
      bgColor: "#E8F5E8",
    },
    {
      title: "Students",
      count: counts.students,
      icon: "people",
      color: "#FFC107",
      bgColor: "#FFF8E1",
    },
    {
      title: "Admins",
      count: counts.admins,
      icon: "settings",
      color: "#6F42C1",
      bgColor: "#F3E5F5",
    },
    {
      title: "Parents",
      count: counts.parents,
      icon: "home",
      color: "#17A2B8",
      bgColor: "#E0F7F7",
    },
    {
      title: "Subjects",
      count: counts.subjects,
      icon: "library",
      color: "#E83E8C",
      bgColor: "#FDE7F0",
    },
    {
      title: "Events",
      count: counts.events,
      icon: "calendar",
      color: "#FD7E14",
      bgColor: "#FFF2E6",
    },
    {
      title: "News",
      count: counts.news,
      icon: "newspaper",
      color: "#20C997",
      bgColor: "#E8F8F5",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshAllData} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School data Overview</Text>
      </View>

      <View style={styles.grid}>
        {dashboardItems.map((item, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: item.bgColor }]}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={item.icon} size={32} color={item.color} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardCount}>{item.count}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Last updated: {new Date().toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontFamily: "System",
  },
  errorText: {
    fontSize: 16,
    color: "#DC3545",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: "System",
  },
  retryButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "System",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    fontFamily: "System",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    fontFamily: "System",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardContent: {
    alignItems: "center",
  },
  cardCount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    fontFamily: "System",
  },
  cardTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "System",
  },
  summaryCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    fontFamily: "System",
  },
  summaryCount: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 8,
    fontFamily: "System",
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontFamily: "System",
  },
  footer: {
    padding: 20,
    alignItems: "center",
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    fontFamily: "System",
  },
});

export default AdminDashboard;
