
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { PrismaService } from '../shared/prisma.service';
import { TelegramAuthMiddleware } from '../shared/telegram.middleware';

@Module({ imports: [GameModule], providers: [PrismaService] })
export class AppModule {
  configure(c: MiddlewareConsumer) {
    c.apply(TelegramAuthMiddleware).forRoutes({ path: 'api/*', method: RequestMethod.ALL });
  }
}
