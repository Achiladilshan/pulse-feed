import { ArticleMeta } from "@/lib/api/news/news.type";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";

export interface CarouselSliderProps {
  data: ArticleMeta[];
  showPagination?: boolean;
  handleItemPress: (id: string, item: ArticleMeta) => void;
}

declare function setInterval(handler: () => void, timeout: number): number;
declare function clearInterval(intervalId: number): void;

const SCREEN_WIDTH = UnistylesRuntime.screen.width;

export const CarouselSlider = (props: CarouselSliderProps) => {
  const { data, handleItemPress, showPagination = false } = props;
  const flatListRef = useRef<FlatList<ArticleMeta>>(null);
  const [currentPage, setCurrentPage] = useState(0);

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

  const renderItem = ({ item }: { item: ArticleMeta }) => (
    <Pressable
      onPress={() => handleItemPress(item.uri, item)}
      style={styles.cardContainer}
    >
      <View style={styles.backgroundWrapper}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="cover"
        />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <LinearGradient
        colors={["#00000000", "#000000"]}
        style={styles.gradientContainer}
      />
    </Pressable>
  );

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
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH - 40,
          offset: (SCREEN_WIDTH - 40) * index,
          index,
        })}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x /
              event.nativeEvent.layoutMeasurement.width,
          );
          setCurrentPage(index);
        }}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index, animated: true });
          }, 500);
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

const styles = StyleSheet.create((_theme) => ({
  carouselContainer: {
    width: "100%",
    height: 250,
  },
  cardContainer: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backgroundWrapper: {
    zIndex: -1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  gradientContainer: {
    position: "absolute",
    bottom: 0,
    width: SCREEN_WIDTH - 40,
    height: 150,
    zIndex: -1,
    pointerEvents: "box-none",
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
}));
