import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * 검수/발행 화면은 승인·발행처럼 민감한 동작을 포함하므로, 외부 서버에
 * 배포할 때는 반드시 보호해야 한다. ADMIN_USER/ADMIN_PASSWORD가 설정된
 * 경우에만 Basic Auth를 강제하고, 설정되지 않으면(로컬 개발) 통과시킨다.
 */
export function basicAuth(req: Request, res: Response, next: NextFunction): void {
  if (!config.adminUser || !config.adminPassword) {
    next();
    return;
  }

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const sepIndex = decoded.indexOf(':');
    const user = decoded.slice(0, sepIndex);
    const pass = decoded.slice(sepIndex + 1);
    if (user === config.adminUser && pass === config.adminPassword) {
      next();
      return;
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="EduFocus Review"');
  res.status(401).send('인증이 필요합니다.');
}
