import * as cheerio from 'cheerio';
import { httpClient, cleanText } from './httpClient';
import { RawItem } from './types';

/**
 * Government / public-portal board pages share a common shape:
 * a list page with rows linking to detail pages, each detail page
 * containing a title, a date, and a body.
 *
 * Selectors below are best-effort defaults for the target site and are
 * intentionally centralized here so they can be tuned without touching
 * crawl logic. See SELECTORS.md for how to find the right values with
 * browser devtools if a site changes its markup.
 */
export interface BoardConfig {
  sourceId: string;
  sourceName: string;
  category?: string;
  listUrl: string;
  /** CSS selector matching each row/article link on the list page */
  listItemSelector: string;
  /** Optional selector (relative to listItemSelector) for the <a> link; defaults to itself or first <a> */
  linkSelector?: string;
  /** Optional selector for a date shown on the list row */
  listDateSelector?: string;
  /** Selector for the title on the detail page */
  detailTitleSelector: string;
  /** Selector for the published date on the detail page */
  detailDateSelector?: string;
  /** Selector for the main body content on the detail page */
  detailBodySelector: string;
  /** Max number of detail pages to fetch per run (politeness / quota control) */
  maxItems?: number;
  /** Delay between detail page requests, in ms */
  requestDelayMs?: number;
}

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function crawlBoard(cfg: BoardConfig): Promise<RawItem[]> {
  const maxItems = cfg.maxItems ?? 10;
  const delay = cfg.requestDelayMs ?? 1000;

  const listRes = await httpClient.get(cfg.listUrl);
  const $list = cheerio.load(listRes.data);

  const links: { url: string; listDate?: string }[] = [];
  $list(cfg.listItemSelector).each((_, el) => {
    const $el = $list(el);
    const $link = cfg.linkSelector ? $el.find(cfg.linkSelector) : $el.is('a') ? $el : $el.find('a').first();
    const href = $link.attr('href');
    if (!href) return;
    const url = resolveUrl(href, cfg.listUrl);
    const listDate = cfg.listDateSelector
      ? cleanText($el.find(cfg.listDateSelector).first().text())
      : undefined;
    links.push({ url, listDate });
  });

  const items: RawItem[] = [];
  for (const { url, listDate } of links.slice(0, maxItems)) {
    try {
      const detailRes = await httpClient.get(url);
      const $detail = cheerio.load(detailRes.data);

      const title = cleanText($detail(cfg.detailTitleSelector).first().text());
      const bodyText = cleanText($detail(cfg.detailBodySelector).first().text());
      const publishedAt = cfg.detailDateSelector
        ? cleanText($detail(cfg.detailDateSelector).first().text()) || listDate
        : listDate;

      if (!title || !bodyText) continue;

      items.push({
        sourceId: cfg.sourceId,
        sourceName: cfg.sourceName,
        category: cfg.category,
        title,
        url,
        publishedAt: publishedAt || null,
        bodyText,
      });
    } catch (err) {
      console.error(`[${cfg.sourceId}] failed to fetch detail ${url}:`, (err as Error).message);
    }
    await sleep(delay);
  }

  return items;
}
