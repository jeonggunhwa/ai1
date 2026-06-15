import axios from 'axios';

export const httpClient = axios.create({
  timeout: 15000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (compatible; EduFocusBot/0.1; +https://edufocus.example/bot) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  },
});

/** Collapse whitespace and strip tags-leftover artifacts from cheerio .text() output. */
export function cleanText(text: string): string {
  return text
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}
