
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class GameService {
  constructor(private db: PrismaService) {}

  async ensurePlayer(user: { tg_id: number; username?: string }) {
    let u = await this.db.user.findUnique({ where: { tg_id: BigInt(user.tg_id) } });
    if (!u) u = await this.db.user.create({ data: { tg_id: BigInt(user.tg_id), username: user.username } });
    let ch = await this.db.character.findFirst({ where: { user_id: u.id } });
    if (!ch) ch = await this.db.character.create({ data: { user_id: u.id, class: 'warrior' } });
    return { user: u, character: ch };
  }

  async startFight(_user: { tg_id: number }, enemy: string) {
    // Упрощённый расчёт боя (сервер‑авторитарно)
    const result = Math.random() > 0.5 ? 'win' : 'lose';
    const log = [
      { turn: 1, you: 'hit', dmg: 10, target: enemy },
      { turn: 2, enemy: 'hit', dmg: 8 }
    ];
    return { result, log, loot: result === 'win' ? [{ gold: 25 }] : [] };
  }
}
