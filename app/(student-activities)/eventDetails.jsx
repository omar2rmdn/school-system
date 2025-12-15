import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const StudentEventDetails = () => {
  const { event } = useLocalSearchParams();
  const parsed = JSON.parse(event);
  const { image, description } = parsed;
  const title = parsed.title || parsed.name;
  const category = parsed.category || parsed.eventCategory || "";

  // Check if text contains Arabic characters (comprehensive regex)
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  const titleIsArabic = isArabic(title || '');
  const categoryIsArabic = isArabic(category || '');
  const descriptionIsArabic = isArabic(description || '');

  return (
    <ScrollView style={styles.container}>
      <Image
        source={typeof image === "string" ? { uri: image } : image}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text 
          style={[
            styles.title,
            titleIsArabic && { textAlign: 'right', writingDirection: 'rtl' }
          ]}
        >
          {title}
        </Text>
        <Text 
          style={[
            styles.category,
            categoryIsArabic && { textAlign: 'right', writingDirection: 'rtl' }
          ]}
        >
          {category}
        </Text>
        <Text 
          style={[
            styles.description,
            descriptionIsArabic && { textAlign: 'right', writingDirection: 'rtl' }
          ]}
        >
          {description}
        </Text>
      </View>
    </ScrollView>
  );
};

export default StudentEventDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  category: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
    fontStyle: "italic",
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 24,
  },
});
