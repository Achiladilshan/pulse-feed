import { apiClient } from "../../api-client";
import { NewsApiResponse } from "./news.type";

export const getNews = async () => {
  const response = await apiClient.get<NewsApiResponse>(
    "/top-headlines?country=us&pageSize=10",
  );
  return response.data;
};

export const searchNews = async (query: string) => {
  const response = await apiClient.get<NewsApiResponse>("/everything", {
    params: {
      q: query,
      pageSize: 10,
    },
  });
  return response.data;
};
