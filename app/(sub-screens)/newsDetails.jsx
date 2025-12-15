import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const getImageSource = (imgParam) => {
  if (typeof imgParam === "string") {
    return { uri: imgParam };
  }
  return imgParam;
};

const NewsDetailsScreen = () => {
  const params = useLocalSearchParams();

  let title = params.title;
  let description = params.description;
  let imageParam = params.image;

  if (params.news) {
    try {
      const parsed = JSON.parse(params.news);
      title = parsed.title || parsed.name || parsed.newsTitle;
      description = parsed.description;
      imageParam = parsed.image;
    } catch (e) {
      console.warn("Failed to parse news param", e);
    }
  }

  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  const titleIsArabic = isArabic(title || "");
  const descriptionIsArabic = isArabic(description || "");

  const imageSource = getImageSource(imageParam);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            titleIsArabic && { textAlign: "right", writingDirection: "rtl" },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.description,
            descriptionIsArabic && {
              textAlign: "right",
              writingDirection: "rtl",
            },
          ]}
        >
          {description}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 15,
    color: "#000",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#000",
  },
});

export default NewsDetailsScreen;
