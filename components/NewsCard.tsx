import { ArticleMeta } from "@/lib/api/news/news.type";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

type NewsCardProps = {
  data: ArticleMeta;
  onPress?: (item: ArticleMeta) => void;
};

const NewsCard = ({ data, onPress }: NewsCardProps) => (
  <Pressable style={styles.container} onPress={() => onPress?.(data)}>
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: data.image }}
        style={{ width: "100%", height: "100%", borderRadius: 8 }}
        contentFit="cover"
      />
    </View>
    <View style={styles.textContainer}>
      <Text>{data.title}</Text>
    </View>
  </Pressable>
);

export default NewsCard;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    height: 50,
  },
  imageContainer: {
    width: 50,
    height: 50,
  },
  textContainer: {
    flex: 1,
    padding: 8,
  },
});
