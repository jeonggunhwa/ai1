import express from 'express';
import path from 'path';
import { config } from '../config';
import { apiRouter } from './routes';

export const app = express();

app.use(express.json());
app.use('/api', apiRouter);
app.use('/', express.static(path.resolve(__dirname, '../../public')));

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`[server] http://localhost:${config.port} (검수 화면: /index.html)`);
  });
}
