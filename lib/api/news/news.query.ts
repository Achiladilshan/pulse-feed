import { createQueryKeys } from "@lukemorales/query-key-factory";
import { getNews, searchNews } from "./news.service";

export const news = createQueryKeys("news", {
  list: {
    queryKey: null,
    queryFn: () => getNews(),
  },
  search: (query: string) => ({
    queryKey: [query],
    queryFn: () => searchNews(query),
  }),
});
