
import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PrismaService } from '../../shared/prisma.service';

@Module({ controllers: [GameController], providers: [GameService, PrismaService] })
export class GameModule {}
