import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

const EMAIL = "hello@company.com";
const PHONE_NUMBER = "+20203801184"; // Use international format for WhatsApp
const WHATSAPP_NUMBER = "+20203801184"; // Must be in international format without leading zeros

const ContactScreen = () => {
  // Open default email app (Gmail if available) with a pre-filled recipient
  const handleEmailPress = () => {
    const emailUrl = `mailto:${EMAIL}`;
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert("Error", "Could not open the email app.");
    });
  };

  // Open phone dialer with the number pre-filled
  const handlePhonePress = () => {
    const phoneUrl = `tel:${PHONE_NUMBER}`;
    Linking.openURL(phoneUrl).catch(() => {
      Alert.alert("Error", "Could not open the phone dialer.");
    });
  };

  // Open WhatsApp chat with the number
  const handleWhatsAppPress = () => {
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert("Error", "Could not open WhatsApp.");
    });
  };

  return (
    <View style={styles.container}>
      {/* Contact Details */}
      <View style={styles.content}>
        <Text style={styles.heading}>Get in touch if you need help.</Text>

        <View style={styles.addressContainer}>
          <Text
            style={[styles.addressText, { fontWeight: "bold", fontSize: 18 }]}
          >
            Address:
          </Text>
          <Text style={styles.addressText}>Sharqiya, Zagazig</Text>
          <Text style={styles.addressText}>Postal Code: 44523</Text>
        </View>

        <View style={styles.contactContainer}>
          <Text style={styles.contactText}>
            <Text style={[styles.contactText, { fontWeight: "bold" }]}>
              Email:{" "}
            </Text>
            {EMAIL}
          </Text>
          <Text style={styles.contactText}>
            <Text style={[styles.contactText, { fontWeight: "bold" }]}>
              Phone Number:{" "}
            </Text>
            {PHONE_NUMBER}
          </Text>
        </View>

        {/* Icons */}
        <View style={styles.iconRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleEmailPress}
          >
            <Icon name="mail" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handlePhonePress}
          >
            <Icon name="phone" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleWhatsAppPress}
          >
            <FontAwesome name="whatsapp" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "80%",
    alignItems: "flex-start",
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 25,
    lineHeight: 30,
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressText: {
    fontSize: 16,
    color: "#4A4A4A",
    fontWeight: "500",
    lineHeight: 24,
  },
  contactContainer: {
    marginBottom: 25,
  },
  contactText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 5,
    lineHeight: 24,
  },
  iconRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  iconButton: {
    width: 45,
    height: 45,
    backgroundColor: "#007BFF",
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
});

export default ContactScreen;
