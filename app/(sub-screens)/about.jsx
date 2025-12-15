import { ScrollView, StyleSheet, Text } from "react-native";

const AboutUsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>About Us</Text>

      <Text style={styles.sectionTitle}>Our Mission</Text>
      <Text style={styles.text}>
        At [School Name], we are committed to providing a nurturing environment
        where students can achieve academic excellence, develop critical
        thinking skills, and become responsible global citizens.
      </Text>

      <Text style={styles.sectionTitle}>Our Vision</Text>
      <Text style={styles.text}>
        We envision a future where every student is empowered with knowledge,
        creativity, and leadership skills to contribute positively to society.
      </Text>

      <Text style={styles.sectionTitle}>Our Values</Text>
      <Text style={styles.text}>
        - Excellence: Striving for the highest standards in education and
        personal growth.
      </Text>
      <Text style={styles.text}>
        - Integrity: Encouraging honesty, responsibility, and ethical behavior.
      </Text>
      <Text style={styles.text}>
        - Inclusivity: Celebrating diversity and fostering a welcoming
        community.
      </Text>
      <Text style={styles.text}>
        - Innovation: Embracing creativity and new learning methods.
      </Text>

      <Text style={styles.sectionTitle}>Contact Us</Text>
      <Text style={styles.text}>
        Address: 1234 School Lane, Education City, Country
      </Text>
      <Text style={styles.text}>Phone: (123) 456-7890</Text>
      <Text style={styles.text}>Email: contact@schoolname.edu</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 120,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});

export default AboutUsScreen;
