export interface RawItem {
  sourceId: string;
  sourceName: string;
  category?: string;
  title: string;
  url: string;
  publishedAt?: string | null;
  bodyText: string;
}

export interface Crawler {
  sourceId: string;
  sourceName: string;
  crawl(): Promise<RawItem[]>;
}
