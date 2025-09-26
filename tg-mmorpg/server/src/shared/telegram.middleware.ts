
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';

function getSecret(botToken: string) {
  return createHmac('sha256', 'WebAppData').update(botToken).digest();
}
function validateInitData(initData: URLSearchParams, botToken: string) {
  const hash = initData.get('hash');
  const entries = Array.from(initData.entries())
    .filter(([k]) => k !== 'hash')
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([k,v]) => `${k}=${v}`)
    .join('\n');
  const secret = getSecret(botToken);
  const sig = createHmac('sha256', secret).update(entries).digest('hex');
  return sig === hash;
}

@Injectable()
export class TelegramAuthMiddleware implements NestMiddleware {
  use(req: any, _res: any, next: () => void) {
    if (req.query && req.query.ref) req._ref = String(req.query.ref);

    if (process.env.DEV_MODE === '1') {
      req.user = { tg_id: 999999, username: 'dev' };
      return next();
    }
    const initData = req.header('x-telegram-init-data') || (req.query && req.query.initData as string);
    if (!initData) throw new UnauthorizedException('No initData');
    const ok = validateInitData(new URLSearchParams(initData), process.env.BOT_TOKEN!);
    if (!ok) throw new UnauthorizedException('Bad signature');
    const user = JSON.parse(new URLSearchParams(initData).get('user')!);
    req.user = { tg_id: user.id, username: user.username };
    next();
  }
}
