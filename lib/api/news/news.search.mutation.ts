import { useMutation } from "@tanstack/react-query";
import { searchNews } from "./news.service";

export const useSearchNews = () =>
  useMutation({
    mutationFn: (searchQuery: string) => searchNews(searchQuery),
  });
