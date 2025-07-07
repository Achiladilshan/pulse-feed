import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { news } from "./news/news.query";

export const queries = mergeQueryKeys(news);
