import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { SCHEMA_SQL } from './schema';

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

export const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.exec(SCHEMA_SQL);

export interface RawItemRow {
  id: number;
  source_id: string;
  source_name: string;
  category: string | null;
  title: string;
  url: string;
  published_at: string | null;
  body_text: string;
  content_hash: string;
  fetched_at: string;
}

export interface DraftRow {
  id: number;
  raw_item_id: number;
  draft_type: 'news' | 'column';
  title: string;
  body_markdown: string;
  facts_json: string;
  source_citation: string;
  ai_model: string;
  ai_disclosure: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'published';
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  published_at: string | null;
  published_url: string | null;
}

export function insertRawItem(item: {
  sourceId: string;
  sourceName: string;
  category?: string;
  title: string;
  url: string;
  publishedAt?: string | null;
  bodyText: string;
  contentHash: string;
}): RawItemRow | null {
  const existing = db
    .prepare('SELECT * FROM raw_items WHERE url = ?')
    .get(item.url) as RawItemRow | undefined;
  if (existing) return null; // already crawled, skip

  const result = db
    .prepare(
      `INSERT INTO raw_items
        (source_id, source_name, category, title, url, published_at, body_text, content_hash)
       VALUES (@sourceId, @sourceName, @category, @title, @url, @publishedAt, @bodyText, @contentHash)`
    )
    .run({
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      category: item.category ?? null,
      title: item.title,
      url: item.url,
      publishedAt: item.publishedAt ?? null,
      bodyText: item.bodyText,
      contentHash: item.contentHash,
    });

  return db
    .prepare('SELECT * FROM raw_items WHERE id = ?')
    .get(result.lastInsertRowid) as RawItemRow;
}

export function getRawItemsWithoutDrafts(limit = 20): RawItemRow[] {
  return db
    .prepare(
      `SELECT r.* FROM raw_items r
       LEFT JOIN drafts d ON d.raw_item_id = r.id
       WHERE d.id IS NULL
       ORDER BY r.id ASC
       LIMIT ?`
    )
    .all(limit) as RawItemRow[];
}

export function insertDraft(draft: {
  rawItemId: number;
  draftType: 'news' | 'column';
  title: string;
  bodyMarkdown: string;
  factsJson: string;
  sourceCitation: string;
  aiModel: string;
  aiDisclosure: string;
}): DraftRow {
  const result = db
    .prepare(
      `INSERT INTO drafts
        (raw_item_id, draft_type, title, body_markdown, facts_json, source_citation, ai_model, ai_disclosure)
       VALUES (@rawItemId, @draftType, @title, @bodyMarkdown, @factsJson, @sourceCitation, @aiModel, @aiDisclosure)`
    )
    .run(draft);

  return db
    .prepare('SELECT * FROM drafts WHERE id = ?')
    .get(result.lastInsertRowid) as DraftRow;
}

export function listDrafts(status?: string): DraftRow[] {
  if (status) {
    return db
      .prepare('SELECT * FROM drafts WHERE status = ? ORDER BY id DESC')
      .all(status) as DraftRow[];
  }
  return db.prepare('SELECT * FROM drafts ORDER BY id DESC').all() as DraftRow[];
}

export function getDraft(id: number): DraftRow | undefined {
  return db.prepare('SELECT * FROM drafts WHERE id = ?').get(id) as
    | DraftRow
    | undefined;
}

export function updateDraftStatus(
  id: number,
  status: 'approved' | 'rejected',
  reviewNotes?: string
): void {
  db.prepare(
    `UPDATE drafts SET status = ?, review_notes = ?, reviewed_at = datetime('now') WHERE id = ?`
  ).run(status, reviewNotes ?? null, id);
}

export function listApprovedUnpublished(limit = 10): DraftRow[] {
  return db
    .prepare(`SELECT * FROM drafts WHERE status = 'approved' ORDER BY id ASC LIMIT ?`)
    .all(limit) as DraftRow[];
}

export function markDraftPublished(id: number, publishedUrl?: string | null): void {
  db.prepare(
    `UPDATE drafts SET status = 'published', published_at = datetime('now'), published_url = ? WHERE id = ?`
  ).run(publishedUrl ?? null, id);
}

export function listRawItems(limit = 50): RawItemRow[] {
  return db
    .prepare('SELECT * FROM raw_items ORDER BY id DESC LIMIT ?')
    .all(limit) as RawItemRow[];
}
