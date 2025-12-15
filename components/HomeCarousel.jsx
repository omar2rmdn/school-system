import { Dimensions, Image, StyleSheet, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

const images = [
  require("../assets/carousel-1.jpg"),
  require("../assets/carousel-2.jpg"),
  require("../assets/carousel-3.jpg"),
  require("../assets/carousel-4.jpg"),
  require("../assets/carousel-4.jpg"),
];

const HomeCarousel = () => {
  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={width}
        height={200}
        autoPlay
        autoPlayInterval={3000}
        data={images}
        scrollAnimationDuration={1000}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={item} style={styles.image} />
          </View>
        )}
      />
    </View>
  );
};

export default HomeCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  imageContainer: {
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: "auto",
  },
  image: {
    width: width - 40,
    height: 200,
    borderRadius: 15,
  },
});
