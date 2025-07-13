export interface ArticleMeta {
  uri: string;
  title: string;
  date: string;
  image: string;
  url: string;
}

export interface ArticleDetail {
  uri: string;
  title: string;
  body: string;
  image: string;
  url: string;
  dateTime: string;
  source: {
    title: string;
  };
}
