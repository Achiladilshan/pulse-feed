import { LRUCache } from 'lru-cache';
import type { Article } from '@/lib/api/news/news.type';

function freeFromMemory(value: { articles: Article[] }) {
  console.log('Evicted from cache:', value);
}

function logInsertion(key: string, value: { articles: Article[] }) {
  console.log('Inserted into cache:', key, value.articles.length, 'articles');
}

export const searchCache = new LRUCache<string, { articles: Article[] }>({
  max: 10, 
  ttl: 1000 * 60 * 5, 
  dispose: (value, key, reason) => freeFromMemory(value),
  onInsert: (value, key, reason) => logInsertion(key, value),
  allowStale: false,
  updateAgeOnGet: true,
});
