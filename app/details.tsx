import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const DetailsScreen = () => {
  const { data, headerTitle } = useLocalSearchParams();
  const parsedData = data ? JSON.parse(data as string) : null;
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: headerTitle?.toString() || "Details",
    });
  }, [headerTitle]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: parsedData?.urlToImage }}
        style={{ width: "100%", height: 200, borderRadius: 16 }}
        contentFit="cover"
      />
      <Text style={styles.title}>{parsedData?.description}</Text>
      <ScrollView style={{ flexGrow: 1 }}>
        <Text>{parsedData?.content}</Text>
      </ScrollView>
    </View>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    flex: 1,
    paddingBottom: rt.insets.bottom,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingVertical: 16,
  },
}));
