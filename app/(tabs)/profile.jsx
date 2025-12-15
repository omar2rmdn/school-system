import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

// Utility function to capitalize first letter of each word
const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const isParent = user?.roles.includes("Parent");
  const router = useRouter();
  const [children, setChildren] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [childrenError, setChildrenError] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!isParent) return;
      try {
        setChildrenLoading(true);
        const res = await axios.get(`${API_BASE}/api/students/parent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.data || [];
        const mapped = data.map((c) => ({
          id: c.id?.toString() ?? "",
          name: c.name,
          className: c.className,
          image:
            c.image && !c.image.startsWith("http")
              ? `${API_BASE}/${c.image}`
              : c.image || null,
        }));
        setChildren(mapped);
      } catch (err) {
        console.error("FETCH-PARENT-CHILDREN", err);
        setChildrenError("Failed to load children");
      } finally {
        setChildrenLoading(false);
      }
    };
    fetchChildren();
  }, [isParent, token]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          {user?.image && !user.image.startsWith("data:") ? (
            <Image
              source={{
                uri: user.image.startsWith("http")
                  ? user.image
                  : `${API_BASE}/${user.image}`,
              }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.role}>{user?.roles?.join(", ")}</Text>
          </View>
        </View>

        {/* Children Section */}
        {isParent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Children</Text>
            {childrenLoading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : childrenError ? (
              <Text style={styles.errorText}>{childrenError}</Text>
            ) : (
              <View style={styles.childrenList}>
                {children.map((child) => (
                  <Pressable
                    key={child.id}
                    style={styles.childCard}
                    onPress={() =>
                      router.push({
                        pathname: "/(student-activities)",
                        params: {
                          studentId: child.id,
                          studentName: capitalizeFirstLetter(child.name),
                        },
                      })
                    }
                  >
                    {child.image ? (
                      <Image
                        source={{ uri: child.image }}
                        style={styles.childImage}
                      />
                    ) : (
                      <View style={styles.childImagePlaceholder}>
                        <Text style={styles.childInitials}>
                          {capitalizeFirstLetter(child.name)
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.childName}>
                      {capitalizeFirstLetter(child.name)}
                    </Text>
                    <Text style={styles.childInfo}>
                      Class {child.className}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 25,
    alignItems: "center",
    marginBottom: 30,
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  role: {
    marginTop: 8,
    backgroundColor: "#E0E7FF",
    color: "#3730A3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 13,
    borderRadius: 999,
    fontWeight: "600",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 15,
  },
  loadingText: {
    color: "#6B7280",
  },
  errorText: {
    color: "#DC2626",
  },
  childrenList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  childCard: {
    width: "47%",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  childImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  childImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  childInitials: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0284C7",
  },
  childName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 4,
  },
  childInfo: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
