import { ArticleDetail } from "@/lib/api/news/news.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LRUCache } from "lru-cache";

const CACHE_KEY = "article_detail_cache";
const RECENT_KEY = "recently_viewed_articles";

interface DetailCacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  latency: number[];
  memoryUsage: number[];
}

export const detailCacheMetrics: DetailCacheMetrics = {
  hits: 0,
  misses: 0,
  totalRequests: 0,
  latency: [],
  memoryUsage: [],
};

const articleDetailCache = new LRUCache<string, ArticleDetail>({
  max: 10,
  ttl: 1000 * 60 * 10, // 10 minutes
  updateAgeOnGet: true,
  dispose: (_value, key, reason) => {
    console.log(`Evicted article ${key} due to ${reason}`);
  },
  noDeleteOnStaleGet: false,
});

// 👇 Tracked for carousel
const recentlyViewed: ArticleDetail[] = [];

export const getArticleFromCache = (uri: string): ArticleDetail | undefined => {
  detailCacheMetrics.totalRequests++;
  const start = performance.now();

  const cached = articleDetailCache.get(uri);

  const latency = performance.now() - start;
  detailCacheMetrics.latency.push(latency);

  if (cached) {
    detailCacheMetrics.hits++;
    return cached;
  } else {
    detailCacheMetrics.misses++;
    return undefined;
  }
};

export const setArticleToCache = async (
  uri: string,
  data: ArticleDetail,
): Promise<void> => {
  articleDetailCache.set(uri, data);
  detailCacheMetrics.memoryUsage.push(JSON.stringify(data).length);

  if (!recentlyViewed.find((a) => a.uri === uri)) {
    recentlyViewed.unshift(data);
    if (recentlyViewed.length > 10) recentlyViewed.pop();
  }

  try {
    // Persist recently viewed
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewed));

    // Persist full cache (optional)
    await AsyncStorage.setItem(`${CACHE_KEY}:${uri}`, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to persist article cache or recently viewed:", err);
  }
};

export const getRecentlyViewed = (): ArticleDetail[] => {
  return recentlyViewed;
};

export const getDetailCacheStats = () => {
  const avgLatency =
    detailCacheMetrics.latency.reduce((a, b) => a + b, 0) /
      detailCacheMetrics.latency.length || 0;
  const avgMemory =
    detailCacheMetrics.memoryUsage.reduce((a, b) => a + b, 0) /
      detailCacheMetrics.memoryUsage.length || 0;

  return {
    hitRate: (
      detailCacheMetrics.hits / detailCacheMetrics.totalRequests
    ).toFixed(2),
    missRate: (
      detailCacheMetrics.misses / detailCacheMetrics.totalRequests
    ).toFixed(2),
    avgLatency: `${avgLatency.toFixed(2)} ms`,
    avgMemoryUsage: `${avgMemory.toFixed(2)} bytes`,
    totalRequests: detailCacheMetrics.totalRequests,
  };
};

// Call this once on app load
export const loadRecentlyViewedFromStorage = async () => {
  try {
    const json = await AsyncStorage.getItem(RECENT_KEY);
    if (json) {
      const items: ArticleDetail[] = JSON.parse(json);
      recentlyViewed.length = 0; // clear in-place
      items.forEach((item) => {
        recentlyViewed.push(item);
        articleDetailCache.set(item.uri, item); // restore to cache
      });
      console.log(
        `Restored ${items.length} recently viewed articles from storage.`,
      );
    }
  } catch (err) {
    console.error("Failed to load recently viewed from storage:", err);
  }
};
