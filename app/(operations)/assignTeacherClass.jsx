import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, useAuth } from "../../context/AuthContext";

const AssignClass = () => {
  const params = useLocalSearchParams();
  const teacher = params.teacher ? JSON.parse(params.teacher) : null;
  const { token } = useAuth();

  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/Classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.data || [];
        setClasses(data);
        if (teacher?.className) {
          const matched = data.find(
            (c) =>
              c.name === teacher.className || c.className === teacher.className
          );
          if (matched) setSelectedClassId(matched.id);
        }
      } catch (err) {
        console.error("FETCH-CLASSES error", err);
        Alert.alert("Error", "Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchClasses();
  }, [token]);

  const assignClass = async () => {
    if (!selectedClassId) {
      return Alert.alert("Error", "Please select a class");
    }

    try {
      const url = `${API_BASE}/api/Admin/teachers/${teacher.id}/assign-class/${selectedClassId}`;
      await axios.post(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.back();
    } catch (err) {
      console.error("ASSIGN-CLASS error", err);
      Alert.alert("Error", "Failed to assign class");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Assign Class to {teacher?.firstName} {teacher?.lastName}
      </Text>

      <TouchableOpacity
        style={styles.pickerContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectedText}>
          {selectedClassId
            ? classes.find((c) => c.id === selectedClassId)?.name ||
              classes.find((c) => c.id === selectedClassId)?.className
            : "Select Class"}
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Classes</Text>
            <FlatList
              data={classes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    setSelectedClassId(item.id);
                  }}
                >
                  <Text style={styles.subjectName}>
                    {item.name || item.className}
                  </Text>
                  {selectedClassId === item.id ? (
                    <MaterialIcons
                      name="radio-button-checked"
                      size={24}
                      color="green"
                    />
                  ) : (
                    <MaterialIcons
                      name="radio-button-unchecked"
                      size={24}
                      color="#888"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.assignButton} onPress={assignClass}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  selectedText: { fontSize: 14, color: "#555", padding: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: "80%",
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  subjectName: { fontSize: 16 },
  modalCloseButton: {
    marginTop: 15,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  assignButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default AssignClass;
