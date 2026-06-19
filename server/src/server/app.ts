import express from 'express';
import path from 'path';
import { config } from '../config';
import { apiRouter } from './routes';
import { basicAuth } from './basicAuth';

export const app = express();

app.use(express.json());
app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.use(basicAuth);
app.use('/api', apiRouter);
app.use('/', express.static(path.resolve(__dirname, '../../public')));

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`[server] http://localhost:${config.port} (검수 화면: /index.html)`);
  });

  // ENABLE_SCHEDULER=1이면 같은 프로세스 안에서 주기적 수집+생성도 실행한다.
  // (SQLite 파일을 쓰는 별도 워커 프로세스를 두면 디스크 공유 문제가 생기므로,
  //  배포 환경에서는 하나의 서비스가 웹 서버와 스케줄러를 함께 담당하도록 한다.)
  if (process.env.ENABLE_SCHEDULER === '1') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../pipeline/scheduler');
  }
}
