import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('api')
export class GameController {
  constructor(private readonly svc: GameService) {}

  @Get('bootstrap') bootstrap() { return this.svc.bootstrap(); }

  @Get('me') me(@Req() req: any, @Query('ref') ref?: string) { return this.svc.me(req.user, ref); }

  @Post('setup') setup(@Req() req: any, @Body() dto: { name: string; class: string; gender: 'male'|'female' }) {
    return this.svc.setupCharacter(req.user, dto);
  }

  @Post('attrs/allocate') attrs(@Req() req: any, @Body() inc: any) {
    return this.svc.allocateAttrs(req.user, inc);
  }

  @Get('skills') skills(@Req() req: any) { return this.svc.listSkills(req.user); }
  @Post('skills/learn') learn(@Req() req: any, @Body() dto: { code: string }) { return this.svc.learnSkill(req.user, dto.code); }

  // Zones & dungeon fights
  @Get('zones') zones() { return this.svc.zones(); }
  @Post('dungeon/start') dungeonStart(@Req() req: any, @Body() dto: { zoneId?: string }) { return this.svc.startDungeonFight(req.user, dto?.zoneId); }
  @Post('dungeon/turn') dungeonTurn(@Req() req: any, @Body() dto: { action: string }) { return this.svc.fightTurn(req.user, dto.action); }

  // Legacy simple fight
  @Post('fight/start-simple') startFight(@Req() req: any, @Body() dto: { enemy: string }) { return this.svc.startFight(req.user, dto.enemy); }

  // Shop / market
  @Get('market/listings') listings() { return this.svc.marketListings(); }
  @Post('market/buy') buy(@Req() req: any, @Body() dto: { listingItemId: number }) { return this.svc.marketBuy(req.user, Number(dto.listingItemId)); }

  // Guilds
  @Post('guild/create') guildCreate(@Req() req: any, @Body() dto: { name: string; tag: string }) { return this.svc.guildCreate(req.user, dto.name, dto.tag); }
  @Post('guild/join') guildJoin(@Req() req: any, @Body() dto: { guildId: number }) { return this.svc.guildJoin(req.user, Number(dto.guildId)); }
  @Post('guild/leave') guildLeave(@Req() req: any) { return this.svc.guildLeave(req.user); }
  @Get('guild/list') guildList(@Query('q') q?: string, @Query('take') take = 50) { return this.svc.guildList(q || '', Number(take) || 50); }

  // World boss
  @Get('worldboss/status') wbStatus() { return this.svc.worldBossStatus(); }
  @Post('worldboss/attack') wbAttack(@Req() req: any, @Body() dto: { action: string }) { return this.svc.worldBossAttack(req.user, dto.action); }

  // Inventory
  @Post('equip') equip(@Req() req: any, @Body() dto: { inventoryId: number }) { return this.svc.equip(req.user, Number(dto.inventoryId)); }
  @Post('unequip') unequip(@Req() req: any, @Body() dto: { inventoryId: number }) { return this.svc.unequip(req.user, Number(dto.inventoryId)); }

  // Stats & profiles
  @Get('leaderboard') leaderboard(@Query('limit') limit?: number) { return this.svc.leaderboard(limit ? Number(limit) : 100); }
  @Get('profile/:id') profile(@Param('id') id: string) { return this.svc.profile(Number(id)); }

  // Crafting & daily & rest
  @Post('craft/mine') mine(@Req() req: any) { return this.svc.mine(req.user); }
  @Post('craft/craft') craft(@Req() req: any, @Body() dto: { recipe: string }) { return this.svc.craft(req.user, dto.recipe); }
  @Post('daily/claim') daily(@Req() req: any) { return this.svc.claimDaily(req.user); }
  @Post('rest') rest(@Req() req: any) { return this.svc.rest(req.user); }
}
