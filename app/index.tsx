import { CarouselSlider } from "@/components/CarouselSlider";
import NewsCard from "@/components/NewsCard";
import {
  fetchArticleDetail,
  getLatestNews,
  searchNews,
} from "@/lib/api/news/news.service";
import { ArticleMeta } from "@/lib/api/news/news.type";
import {
  getArticleFromCache,
  getRecentlyViewed,
  loadRecentlyViewedFromStorage,
  setArticleToCache,
} from "@/lib/cache/articleDetailCache";
import "@/theme/unistyle";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<ArticleMeta[]>([]);
  const [activeSearch, setActiveSearch] = useState(false);

  let recentlyViewed = getRecentlyViewed();

  const loadInitialNews = async () => {
    try {
      const latest = await getLatestNews();
      setSearchResults(latest);
    } catch (err) {
      console.error("Failed to load latest news:", err);
    }
  };
  useEffect(() => {
    loadInitialNews();
    loadRecentlyViewedFromStorage();
  }, []);

  const handleSearch = async () => {
    const trimmed = searchText.trim();
    if (!trimmed) return;
    try {
      const results = await searchNews(trimmed);
      setSearchResults(results);
      setActiveSearch(true);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleClearSearch = () => {
    setSearchText("");
    setSearchResults([]);
    setActiveSearch(false);
    loadInitialNews();
  };

  const handleItemPress = async (item: ArticleMeta) => {
    const start = performance.now(); // start latency timer

    const cached = getArticleFromCache(item.uri); // tracks hit/miss + latency internally
    if (cached) {
      router.push({
        pathname: "/details",
        params: { data: JSON.stringify(cached), headerTitle: cached.title },
      });
      return;
    }

    try {
      const fullData = await fetchArticleDetail(item.uri);

      // Save to cache (also pushes into recentlyViewed)
      setArticleToCache(item.uri, fullData);

      const latency = performance.now() - start;
      console.log(`CACHE MISS (fetched): ${latency.toFixed(2)} ms`);

      router.push({
        pathname: "/details",
        params: { data: JSON.stringify(fullData), headerTitle: fullData.title },
      });
    } catch (err) {
      console.error("Failed to fetch full article:", err);
    } finally {
      recentlyViewed = getRecentlyViewed();
    }
  };

  const renderItem = ({ item }: { item: ArticleMeta }) => (
    <NewsCard data={item} onPress={handleItemPress} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons
          name="star-three-points-outline"
          size={24}
          color="black"
        />
        <Text style={styles.headerText}>PulseFeed</Text>
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar}
            placeholder="Search news..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
        <Pressable
          style={{
            width: "15%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={activeSearch ? handleClearSearch : handleSearch}
        >
          <Text style={styles.searchText}>
            {activeSearch ? "Clear" : "Search"}
          </Text>
        </Pressable>
      </View>
      <View style={styles.carouselContainer}>
        <Text style={styles.sectionTitle}>Recently Viewed</Text>
        {recentlyViewed.length > 0 && (
          <CarouselSlider
            data={recentlyViewed as unknown as ArticleMeta[]}
            showPagination={true}
            handleItemPress={(_id, item) => handleItemPress(item)}
          />
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>
          {activeSearch ? "Search Results" : "Top News"}
        </Text>
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={(item) => item.uri}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((_theme, rt) => ({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: rt.insets.top + 20,
    paddingBottom: rt.insets.bottom,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  carouselContainer: {
    marginTop: 20,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "black",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    backgroundColor: "#eeeeee",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBar: {
    height: 40,
    fontSize: 16,
    flex: 1,
  },
  searchText: {
    fontSize: 13,
    fontWeight: "700",
  },
  contentContainer: {
    marginTop: 30,
    flex: 1,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
}));
