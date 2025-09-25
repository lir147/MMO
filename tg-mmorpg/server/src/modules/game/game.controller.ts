
import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('api')
export class GameController {
  constructor(private svc: GameService) {}

  @Get('me')
  me(@Req() req: any) { return this.svc.ensurePlayer(req.user); }

  @Post('fight/start')
  startFight(@Req() req: any, @Body() dto: { enemy: string }) {
    return this.svc.startFight(req.user, dto.enemy);
  }
}
