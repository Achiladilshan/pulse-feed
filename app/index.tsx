import { CarouselSlider } from "@/components/CarouselSlider";
import NewsCard from "@/components/NewsCard";
import { useSearchNews } from "@/lib/api/news/news.search.mutation";
import { Article } from "@/lib/api/news/news.type";
import { queries } from "@/lib/api/queries";
import { searchCache } from "@/lib/cache";
import "@/theme/unistyle";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { StyleSheet } from "react-native-unistyles";

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<Article[]>([]);

  const { data: newsData } = useQuery(queries.news.list);
  const searchMutation = useSearchNews();

  const handleSearch = () => {
  const trimmed = searchText.trim();
  if (!trimmed) return;

  const cached = searchCache.get(trimmed);
  console.log('cached:', cached?.articles.length);
  if (cached) {
    console.log('From cache:', trimmed);
    setSearchResults(cached.articles);
    setActiveSearch(true);
    return;
  }

  searchMutation.mutate(trimmed, {
    onSuccess: (data) => {
      const articles = data.articles ?? [];
      searchCache.set(trimmed, { articles });
      setSearchResults(articles);
      setActiveSearch(true);
    },
    onError: (error) => {
      console.error("Search error:", error);
    },
  });
};

  const handleClearSearch = () => {
    setSearchText("");
    setSearchResults([]);
    setActiveSearch(false);
  };

  const handleItemPress = (item: Article) => {
    router.push({
      pathname: "/details",
      params: { data: JSON.stringify(item), headerTitle: item.title },
    });
  };

  const renderItem = ({ item }: { item: Article }) => (
    <NewsCard data={item} onPress={handleItemPress} />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <MaterialCommunityIcons
          name="star-three-points-outline"
          size={24}
          color="black"
        />
        <Text style={styles.headerText}>PulseFeed</Text>
      </View>

      {/* Search */}
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
          {activeSearch ? (
            <Text style={styles.searchText}>Clear</Text>
          ) : (
            <Text style={styles.searchText}>Search</Text>
          )}
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.carouselContainer}>
          <Text style={styles.sectionTitle}>Recently Viewed</Text>
          <CarouselSlider
            data={newsData?.articles ?? []}
            showPagination={true}
            handleItemPress={(id, item) =>
              console.log("Item pressed:", id, item)
            }
          />
        </View>

        <View style={styles.newsContainer}>
          <Text style={styles.sectionTitle}>
            {activeSearch ? "Search Results" : "Top News"}
          </Text>

          <FlatList
            data={
              activeSearch
                ? searchResults
                : newsData?.articles ?? []
            }
            renderItem={renderItem}
            keyExtractor={(_item, index) => index.toString()}
            ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
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
  carouselContainer: {},
  newsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  contentContainer: {
    marginTop: 30,
    flex: 1,
    gap: 20,
  },
}));
