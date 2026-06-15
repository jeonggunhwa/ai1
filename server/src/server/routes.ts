import { Router } from 'express';
import { getDraft, listDrafts, listRawItems, markDraftPublished, updateDraftStatus } from '../db';
import { runCrawl } from '../pipeline/runCrawl';
import { runGenerate } from '../pipeline/runGenerate';
import { runPublish } from '../pipeline/runPublish';
import { publishDraft } from '../publisher/httpPublisher';

export const apiRouter = Router();

apiRouter.get('/raw-items', (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  res.json(listRawItems(limit));
});

apiRouter.get('/drafts', (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  res.json(listDrafts(status));
});

apiRouter.get('/drafts/:id', (req, res) => {
  const draft = getDraft(Number(req.params.id));
  if (!draft) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.json(draft);
});

apiRouter.post('/drafts/:id/approve', (req, res) => {
  const id = Number(req.params.id);
  if (!getDraft(id)) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  updateDraftStatus(id, 'approved', req.body?.reviewNotes);
  res.json(getDraft(id));
});

apiRouter.post('/drafts/:id/reject', (req, res) => {
  const id = Number(req.params.id);
  if (!getDraft(id)) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  updateDraftStatus(id, 'rejected', req.body?.reviewNotes);
  res.json(getDraft(id));
});

apiRouter.post('/crawl', async (_req, res) => {
  try {
    const result = await runCrawl();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

apiRouter.post('/generate', async (req, res) => {
  try {
    const limit = Number(req.body?.limit ?? 10);
    const result = await runGenerate(limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

apiRouter.post('/drafts/:id/publish', async (req, res) => {
  const id = Number(req.params.id);
  const draft = getDraft(id);
  if (!draft) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  if (draft.status !== 'approved') {
    res.status(400).json({ error: '승인된(approved) 초안만 발행할 수 있습니다.' });
    return;
  }
  try {
    const result = await publishDraft(draft);
    markDraftPublished(id, result.publishedUrl);
    res.json(getDraft(id));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

apiRouter.post('/publish', async (req, res) => {
  try {
    const limit = Number(req.body?.limit ?? 10);
    const result = await runPublish(limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
