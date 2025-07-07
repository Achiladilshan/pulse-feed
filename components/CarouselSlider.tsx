import { Article } from "@/lib/api/news/news.type";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export interface CarouselSliderProps {
  data: Article[];
  showPagination?: boolean;
  handleItemPress: (id: string, item: Article) => void;
}

declare function setInterval(handler: () => void, timeout: number): number;
declare function clearInterval(intervalId: number): void;

const SCREEN_WIDTH = UnistylesRuntime.screen.width;

export const CarouselSlider = (props: CarouselSliderProps) => {
  const { data, handleItemPress, showPagination = false } = props;
  const flatListRef = useRef<FlatList<Article>>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // careousel auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % data.length);
      flatListRef.current?.scrollToIndex({
        index: (currentPage + 1) % data.length,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [data.length, currentPage]);

  const renderItem = ({ item }: { item: Article }) => {
    return (
      <View
        style={{
          width: SCREEN_WIDTH - 40,
          borderRadius: 16,
          overflow: "hidden",
          justifyContent: "flex-end",
          paddingBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            zIndex: -1,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <Image
            source={{ uri: item.urlToImage }}
            style={styles.image}
            contentFit="cover"
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <LinearGradient colors={["#00000000", "#000000"]} style={styles.gradientContainer} />
      </View>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x /
              event.nativeEvent.layoutMeasurement.width
          );
          setCurrentPage(index);
        }}
      />

      {showPagination && data.length > 1 && (
        <View style={styles.paginationContainer}>
          {data.map((_, index) => (
            <Pressable
              key={index}
              style={
                index === currentPage
                  ? styles.paginationDotActive
                  : styles.paginationDotInactive
              }
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  carouselContainer: {
    width: "100%",
    height: 250,
  },
  paginationContainer: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 5,
    paddingTop: 12,
  },
  paginationDotActive: {
    width: 6,
    height: 6,
    backgroundColor: "#dddddd",
    borderRadius: 99,
  },
  paginationDotInactive: {
    width: 6,
    height: 6,
    backgroundColor: "#eeeeee",
    borderRadius: 99,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    color: "white",
    fontWeight: "bold",
  },
  gradientContainer: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH - 40,
    height: 150,
    zIndex: -1,
    pointerEvents: "box-none",
  },
}));
