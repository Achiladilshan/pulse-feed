import { apiClient } from "../../api-client";
import { ArticleDetail, ArticleMeta } from "./news.type";

export const searchNews = async (query: string): Promise<ArticleMeta[]> => {
  const body = {
    action: "getArticles",
    keyword: query,
    sourceLocationUri: [
      "http://en.wikipedia.org/wiki/United_States",
      "http://en.wikipedia.org/wiki/Canada",
      "http://en.wikipedia.org/wiki/United_Kingdom",
    ],
    ignoreSourceGroupUri: "paywall/paywalled_sources",
    articlesPage: 1,
    articlesCount: 10,
    articlesSortBy: "date",
    articlesSortByAsc: false,
    dataType: ["news", "pr"],
    resultType: "articles",
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  };

  const res = await apiClient.post("/api/v1/article/getArticles", body);
  return res.data.articles.results.map((a: any) => ({
    uri: a.uri,
    title: a.title,
    image: a.image,
    url: a.url,
    date: a.date,
  }));
};

export const fetchArticleDetail = async (
  uri: string,
): Promise<ArticleDetail> => {
  const res = await apiClient.post("/api/v1/article/getArticle", {
    action: "getArticle",
    articleUri: uri,
    infoArticleBodyLen: -1,
    resultType: "info",
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  });

  const raw = res.data[uri].info;

  return {
    uri: raw.uri,
    title: raw.title,
    body: raw.body,
    image: raw.image,
    url: raw.url,
    dateTime: raw.dateTime,
    source: raw.source,
  };
};

export const getLatestNews = async (): Promise<ArticleMeta[]> => {
  const res = await apiClient.post("/api/v1/minuteStreamArticles", {
    articleBodyLen: -1,
    lang: ["eng"],
    includeArticleConcepts: true,
    includeArticleCategories: true,
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
  });

  const activity = res.data.recentActivityArticles.activity;

  // Filter out items without images, limit to 15
  const filtered = activity
    .filter((a: any) => a.image && a.image !== "")
    .slice(0, 15);

  return filtered.map((a: any) => ({
    uri: a.uri,
    title: a.title,
    image: a.image,
    url: a.url,
    date: a.dateTime,
  }));
};
