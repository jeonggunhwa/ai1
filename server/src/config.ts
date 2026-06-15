import 'dotenv/config';
import path from 'path';

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  dbPath: process.env.DB_PATH
    ? path.resolve(process.cwd(), process.env.DB_PATH)
    : path.resolve(process.cwd(), 'data/edufocus.db'),
  port: Number(process.env.PORT || 4000),
  crawlCron: process.env.CRAWL_CRON || '0 6,12,18 * * *',
  mediaName: process.env.MEDIA_NAME || '교육포커스',
};
