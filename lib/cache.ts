import type { Article } from "@/lib/api/news/news.type";
import { LRUCache } from "lru-cache";

interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  apiCalls: number;
  latency: number[];
  memoryUsage: number[];
}

export const cacheMetrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  totalRequests: 0,
  apiCalls: 0,
  latency: [],
  memoryUsage: [],
};

function freeFromMemory(value: { articles: Article[] }) {
  console.log("Evicted from cache:", value);
}

function logInsertion(key: string, value: { articles: Article[] }) {
  console.log("Inserted into cache:", key, value.articles.length, "articles");
}

export const searchCache = new LRUCache<string, { articles: Article[] }>({
  max: 10,
  ttl: 1000 * 60 * 5,
  dispose: (value, _key, _reason) => freeFromMemory(value),
  onInsert: (value, key, _reason) => logInsertion(key, value),
  allowStale: false,
  updateAgeOnGet: true,
});

export function getCacheStats() {
  const avgLatency =
    cacheMetrics.latency.reduce((a, b) => a + b, 0) /
      cacheMetrics.latency.length || 0;
  const avgMemory =
    cacheMetrics.memoryUsage.reduce((a, b) => a + b, 0) /
      cacheMetrics.memoryUsage.length || 0;

  return {
    hitRate: (cacheMetrics.hits / cacheMetrics.totalRequests).toFixed(2),
    missRate: (cacheMetrics.misses / cacheMetrics.totalRequests).toFixed(2),
    avgLatency: avgLatency.toFixed(2) + "ms",
    avgMemoryUsage: avgMemory.toFixed(2) + " bytes",
    apiCalls: cacheMetrics.apiCalls,
    totalRequests: cacheMetrics.totalRequests,
  };
}
