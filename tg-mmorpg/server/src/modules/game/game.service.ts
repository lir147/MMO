
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import * as https from 'https';

type Stats = Record<string, number>;
type Drop = { code: string; chance: number; min?: number; max?: number };
type Element = 'physical'|'fire'|'poison'|'ice';
type Monster = { name: string; baseHp: number; baseAtk: number; xp: number; gold: number; drops: Drop[]; resists?: Partial<Record<Element, number>> };
type Zone = { id: string; name: string; minLevel: number; monsters: Monster[] };

type Battle = {
  player: { hp: number; maxHp: number; atk: number; crit: number; dodge: number; effects?: any[]; mp?: number; maxMp?: number };
  enemy: { name: string; hp: number; maxHp: number; atk: number; xp: number; gold: number; drops: Drop[]; effects?: any[]; elite?: boolean; resists?: Partial<Record<Element, number>> };
  zoneId: string;
  turn: 'player'|'enemy'|'ended';
  log: any[];
  cooldowns?: Record<string, number>;
  playerEnergy?: number;
};

const CLASS_BASE: Record<string, Stats> = {
  warrior: { str: 8, agi: 4, int: 2, vit: 8, dex: 4, luck: 2 },
  rogue:   { str: 5, agi: 8, int: 3, vit: 5, dex: 7, luck: 4 },
  mage:    { str: 2, agi: 4, int: 9, vit: 5, dex: 4, luck: 3 },
};
const CLASSES = Object.keys(CLASS_BASE);

const SHOP: { code: string; price: number }[] = [
  { code: 'rusty_sword', price: 50 },
  { code: 'cloth_cap',   price: 25 },
  { code: 'cloth_robe',  price: 40 },
  { code: 'leather_boots', price: 60 },
  { code: 'iron_helm', price: 120 },
  { code: 'apprentice_staff', price: 100 },
  { code: 'iron_sword',  price: 200 },
];

@Injectable()
export class GameService implements OnModuleInit {
  private auctions = new Map<string, any>();
  private guildTreasury = new Map<number, number>();
  private battles = new Map<number, Battle>();

  constructor(private db: PrismaService) {}

  async onModuleInit() {
    // Seed item sets
    if (await this.db.itemSet.count() === 0) {
      await this.db.itemSet.createMany({ data: [
        { code: 'adventurer',  name: 'Набор Авантюриста',    bonuses: JSON.stringify({ "2": { str: 2 }, "3": { atk: 5 } }) },
        { code: 'swamp_raider',name: 'Болотный Рейдер',      bonuses: JSON.stringify({ "2": { agi: 2, dex: 1 }, "3": { atk: 8 } }) },
        { code: 'sun_scourge', name: 'Проклятие Солнца',      bonuses: JSON.stringify({ "2": { str: 3 }, "3": { hp: 40, atk: 10 } }) },
        { code: 'ice_peak',    name: 'Ледяной Пик',           bonuses: JSON.stringify({ "2": { int: 3 }, "3": { hp: 30, atk: 6 } }) },
      ]});
    }
    // Seed items
    if (await this.db.item.count() === 0) {
      await this.db.item.createMany({ data: [
        // starter gear
        { code: 'rusty_sword', name: 'Ржавый меч', type: 'weapon', slot: 'weapon', rarity: 'C', min_lvl: 1, power: 5,  stats: JSON.stringify({ atk: 5 }), set_code: null },
        { code: 'cloth_cap',  name: 'Шапка новичка', type: 'armor',  slot: 'head',   rarity: 'C', min_lvl: 1, power: 1,  stats: JSON.stringify({ hp: 10 }), set_code: 'adventurer' },
        { code: 'cloth_robe', name: 'Роба новичка',  type: 'armor',  slot: 'chest',  rarity: 'C', min_lvl: 1, power: 1,  stats: JSON.stringify({ hp: 15 }), set_code: 'adventurer' },
        { code: 'leather_boots', name: 'Кожаные сапоги', type: 'armor', slot: 'feet', rarity: 'C', min_lvl: 2, power: 1, stats: JSON.stringify({ agi: 1, dex: 1 }), set_code: null },
        { code: 'iron_helm', name: 'Железный шлем', type: 'armor', slot: 'head', rarity: 'B', min_lvl: 3, power: 3, stats: JSON.stringify({ hp: 25, vit: 1 }), set_code: null },
        { code: 'apprentice_staff', name: 'Посох ученика', type: 'weapon', slot: 'weapon', rarity: 'C', min_lvl: 1, power: 6, stats: JSON.stringify({ int: 2, atk: 3 }), set_code: null },
        // resources & loot
        { code: 'iron_ore',   name: 'Железная руда', type: 'resource', rarity: 'C', min_lvl: 1, power: 0,  stats: '{}' , set_code: null },
        { code: 'slime_gel',  name: 'Слизь', type: 'resource', rarity: 'C', min_lvl: 1, power: 0, stats: '{}', set_code: null },
        { code: 'wolf_pelt',  name: 'Волчья шкура', type: 'resource', rarity: 'C', min_lvl: 1, power: 0, stats: '{}', set_code: null },
        { code: 'rat_tail',   name: 'Крысиный хвост', type: 'resource', rarity: 'C', min_lvl: 1, power: 0, stats: '{}', set_code: null },
        { code: 'goblin_dagger', name: 'Кинжал гоблина', type: 'weapon', slot: 'weapon', rarity: 'C', min_lvl: 3, power: 7, stats: JSON.stringify({ atk: 7, agi: 1 }), set_code: null },
        { code: 'skeleton_bone', name: 'Кость скелета', type: 'resource', rarity: 'C', min_lvl: 5, power: 0, stats: '{}', set_code: null },
        { code: 'ghost_essence', name: 'Эссенция призрака', type: 'resource', rarity: 'B', min_lvl: 7, power: 0, stats: '{}', set_code: null },
        { code: 'iron_sword', name: 'Железный меч',  type: 'weapon', slot: 'weapon', rarity: 'B', min_lvl: 2, power: 12, stats: JSON.stringify({ atk: 12 }), set_code: null },
      ]});
    }
    // Seed recipes
    if (await this.db.recipe.count() === 0) {
      await this.db.recipe.createMany({ data: [
        { code: 'iron_sword',         result_item_code: 'iron_sword',         req: JSON.stringify({ iron_ore: 3 }) },
        { code: 'leather_boots',      result_item_code: 'leather_boots',      req: JSON.stringify({ wolf_pelt: 2 }) },
        { code: 'apprentice_staff',   result_item_code: 'apprentice_staff',   req: JSON.stringify({ ghost_essence: 1, skeleton_bone: 1 }) },
        { code: 'iron_helm',          result_item_code: 'iron_helm',          req: JSON.stringify({ iron_ore: 4 }) },
      ]});
    }
    // Seed skills
    if (await this.db.skill.count() === 0) {
      await this.db.skill.createMany({ data: [
        { code:'slash',        name:'Мощный удар',   description:'Сильный удар (STR)', cls:'warrior', req: JSON.stringify({ level:1 }), maxLevel:5 },
        { code:'shield_bash',  name:'Удар щитом',    description:'Тяжёлый удар (VIT)', cls:'warrior', req: JSON.stringify({ level:2 }), maxLevel:5 },
        { code:'backstab',     name:'Удар в спину',  description:'Критический удар (AGI)', cls:'rogue', req: JSON.stringify({ level:1 }), maxLevel:5 },
        { code:'poison',       name:'Яд',            description:'Урон ядом (AGI)',   cls:'rogue',   req: JSON.stringify({ level:2 }), maxLevel:5 },
        { code:'fireball',     name:'Огненный шар',  description:'Магический урон (INT)', cls:'mage', req: JSON.stringify({ level:1 }), maxLevel:5 },
        { code:'ice_spike',    name:'Ледяной шип',   description:'Холод (INT)',       cls:'mage',     req: JSON.stringify({ level:2 }), maxLevel:5 },
        { code:'vitality',     name:'Живучесть',     description:'+HP от VIT (пассив)', cls:null,     req: JSON.stringify({ level:1 }), maxLevel:5 },
      ]});
    }
  }

  bootstrap() {
    return {
      classes: CLASSES.map(k => ({ code: k, base: CLASS_BASE[k] })),
      genders: ['male','female'],
      nameRules: { min: 3, max: 16, pattern: "^[A-Za-zА-Яа-я0-9_]+$" },
      startPoints: { attr: 10, skill: 2 },
    };
  }

  // --- Zones ---
  zones(): Zone[] {
    return [
      { id: 'forest-1', name: 'Лес новичка (1-3)', minLevel: 1, monsters: [
        { name:'Слизень', baseHp: 30, baseAtk: 5, xp: 15, gold: 5, drops: [{code:'slime_gel', chance:0.7, min:1, max:2}], resists: { poison: 0.2 } } ,
        { name:'Волк', baseHp: 40, baseAtk: 7, xp: 20, gold: 7, drops: [{code:'wolf_pelt', chance:0.5, min:1, max:1}], resists: { physical: 0.1 } },
      ]},
      { id: 'swamp-1', name: 'Болото (3-5)', minLevel: 3, monsters: [
        { name:'Болотная крыса', baseHp: 48, baseAtk: 8, xp: 24, gold: 9, drops: [{code:'rat_tail', chance:0.65, min:1, max:2}] },
        { name:'Ядовитый слизень', baseHp: 52, baseAtk: 9, xp: 27, gold: 10, drops: [{code:'slime_gel', chance:0.75, min:1, max:2}] },
      ]},
      { id: 'cave-1', name: 'Пещера (4-6)', minLevel: 4, monsters: [
        { name:'Крыса', baseHp: 55, baseAtk: 9, xp: 28, gold: 10, drops: [{code:'rat_tail', chance:0.6, min:1, max:2}], resists: { poison: 0.1 } },
        { name:'Гоблин', baseHp: 65, baseAtk: 12, xp: 35, gold: 14, drops: [{code:'goblin_dagger', chance:0.25, min:1, max:1}], resists: { physical: 0.05, fire: 0.05 } },
      ]},
      { id: 'desert-1', name: 'Пустыня (6-8)', minLevel: 6, monsters: [
        { name:'Песчаная змея', baseHp: 70, baseAtk: 14, xp: 42, gold: 18, drops: [{code:'wolf_pelt', chance:0.35, min:1, max:1}] },
        { name:'Разбойник', baseHp: 68, baseAtk: 16, xp: 46, gold: 22, drops: [{code:'goblin_dagger', chance:0.33, min:1, max:1}] },
      ]},
      { id: 'ruins-1', name: 'Руины (7+)', minLevel: 7, monsters: [
        { name:'Скелет', baseHp: 80, baseAtk: 15, xp: 45, gold: 20, drops: [{code:'skeleton_bone', chance:0.6, min:1, max:2}], resists: { physical: 0.25, poison: 0.3 } },
        { name:'Призрак', baseHp: 70, baseAtk: 18, xp: 55, gold: 25, drops: [{code:'ghost_essence', chance:0.3, min:1, max:1}], resists: { physical: 0.4, fire: 0.1, poison: 0.5, ice: 0.2 } },
      ]},
      { id: 'mountain-1', name: 'Гора (9+)', minLevel: 9, monsters: [
        { name:'Горный волк', baseHp: 95, baseAtk: 20, xp: 60, gold: 28, drops: [{code:'wolf_pelt', chance:0.5, min:1, max:2}] },
        { name:'Каменный голем', baseHp: 110, baseAtk: 22, xp: 75, gold: 35, drops: [{code:'iron_ore', chance:0.8, min:2, max:4}] },
      ]},
    ];
  }

  // --- Player & character bootstrap ---
  async me(user: { tg_id: number; username?: string }, ref?: string) {
    let u = await this.db.user.findUnique({ where: { tg_id: BigInt(user.tg_id) } });
    if (!u) u = await this.db.user.create({ data: { tg_id: BigInt(user.tg_id), username: user.username, referralCode: this.randRef(), referredBy: ref || null } });
    let ch = await this.db.character.findFirst({ where: { user_id: u.id } });
    if (!ch) {
      const base = CLASS_BASE['warrior'];
      ch = await this.db.character.create({ data: { user_id: u.id, class: 'warrior', str: base.str, agi: base.agi, int: base.int, vit: base.vit, dex: base.dex, luck: base.luck, initialized: false, availableAttrPoints: 10, availableSkillPoints: 2 } as any });
    }
    const invRaw = await this.db.inventory.findMany({ where: { char_id: ch.id }, include: { item: { include: { set: true } } } });
    const inventory = invRaw.map(v => ({ ...v, item: { ...v.item, stats: this.parseJSON(v.item.stats) } }));
    const skills = await this.db.characterSkill.findMany({ where: { char_id: ch.id }, include: { skill: true } });
    return { user: { ...u, referralCode: u.referralCode }, character: ch, inventory, skills };
  }

  async setupCharacter(user: { tg_id: number }, dto: { name: string; class: string; gender: 'male'|'female' }) {
    const u = await this.db.user.findUnique({ where: { tg_id: BigInt(user.tg_id) } });
    if (!u) throw new BadRequestException('Нет пользователя');
    const ch = await this.db.character.findFirst({ where: { user_id: u.id } });
    if (!ch) throw new BadRequestException('Нет персонажа');
    if (ch.initialized) throw new BadRequestException('Персонаж уже создан');

    const cls = (dto.class || '').toLowerCase();
    if (!CLASSES.includes(cls)) throw new BadRequestException('Нет такого класса');

    const name = (dto.name || '').trim();
    if (name.length < 3 || name.length > 16 || !/^[A-Za-zА-Яа-я0-9_]+$/.test(name)) throw new BadRequestException('Неверное имя');

    const base = CLASS_BASE[cls];
    const updated = await this.db.character.update({ where: { id: ch.id }, data: {
      name, class: cls, gender: dto.gender, str: base.str, agi: base.agi, int: base.int, vit: base.vit, dex: base.dex, luck: base.luck,
      initialized: true, availableAttrPoints: 10, availableSkillPoints: 2
    } as any });

    const starter = await this.db.skill.findFirst({ where: { cls } });
    if (starter) {
      await this.db.characterSkill.upsert({
        where: { char_id_skill_code: { char_id: ch.id, skill_code: starter.code } },
        update: { level: 1 },
        create: { char_id: ch.id, skill_code: starter.code, level: 1 },
      });
    }
    return { ok: true, character: updated };
  }

  async allocateAttrs(user: { tg_id: number }, inc: { str?: number; agi?: number; int?: number; vit?: number; dex?: number; luck?: number }) {
    const { character: ch } = await this.ensurePlayer(user);
    const keys = ['str','agi','int','vit','dex','luck'] as const;
    const total = keys.reduce((s,k)=> s + Math.max(0, Number((inc as any)[k] ?? 0)), 0);
    if (total <= 0) throw new BadRequestException('Нечего распределять');
    if (ch.availableAttrPoints < total) throw new BadRequestException('Нет очков');
    const data: any = { availableAttrPoints: ch.availableAttrPoints - total };
    for (const k of keys) {
      const add = Math.max(0, Number((inc as any)[k] ?? 0));
      if (add > 0) (data as any)[k] = (ch as any)[k] + add;
    }
    const upd = await this.db.character.update({ where: { id: ch.id }, data });
    return { ok: true, character: upd };
  }

  async listSkills(user: { tg_id: number }) {
    const { character: ch } = await this.ensurePlayer(user);
    const all = await this.db.skill.findMany({ where: { OR: [{ cls: null }, { cls: ch.class }] } });
    const learned = await this.db.characterSkill.findMany({ where: { char_id: ch.id } });
    const byCode: Record<string, number> = Object.fromEntries(learned.map(l => [l.skill_code, l.level]));
    return all.map(s => ({ ...s, learnedLevel: byCode[s.code] ?? 0, element: this.skillElement(s.code), cost: this.skillCost(s.code) }));
  }

  async learnSkill(user: { tg_id: number }, code: string) {
    const { character: ch } = await this.ensurePlayer(user);
    if (ch.availableSkillPoints <= 0) throw new BadRequestException('Нет очков навыков');
    const s = await this.db.skill.findUnique({ where: { code } });
    if (!s) throw new BadRequestException('Нет такого навыка');
    if (s.cls && s.cls !== ch.class) throw new BadRequestException('Другой класс');
    const req = this.parseJSON<{ level?: number }>(s.req) || {};
    if (req.level && ch.level < req.level) throw new BadRequestException(`Требуется уровень ${req.level}`);
    const current = await this.db.characterSkill.findUnique({ where: { char_id_skill_code: { char_id: ch.id, skill_code: s.code } } });
    const nextLevel = (current?.level ?? 0) + 1;
    if (nextLevel > s.maxLevel) throw new BadRequestException('Макс. уровень');
    await this.db.$transaction([
      this.db.character.update({ where: { id: ch.id }, data: { availableSkillPoints: ch.availableSkillPoints - 1 } }),
      this.db.characterSkill.upsert({
        where: { char_id_skill_code: { char_id: ch.id, skill_code: s.code } },
        update: { level: nextLevel },
        create: { char_id: ch.id, skill_code: s.code, level: nextLevel },
      })
    ]);
    return { ok: true, code, level: nextLevel };
  }

  // -------- DUNGEONS: manual skills + loot/exp --------
  async startDungeonFight(user: { tg_id: number }, zoneId?: string) {
    const { character: ch } = await this.ensurePlayer(user);
    const zones = this.zones();
    let zone = zoneId ? zones.find(z => z.id === zoneId) : undefined;
    if (!zone) zone = zones.filter(z => ch.level >= z.minLevel).sort((a,b)=>b.minLevel-a.minLevel)[0] || zones[0];

    const stats = await this.computeStats(ch.id);
    const m = this.rollMonster(zone, ch.level);
    const battle: Battle = {
      player: { ...stats, effects: [] } as any,
      enemy: { ...m, effects: [] } as any,
      zoneId: zone.id,
      turn: 'player',
      cooldowns: {} as Record<string, number>,
      log: [{ t: 'start', zone: zone.id, enemy: m.name }],
      playerEnergy: ch.energy,
    };
    this.battles.set(ch.id, battle);
    return { state: battle };
  }

  async fightTurn(user: { tg_id: number }, action: string) {
    const { character: ch } = await this.ensurePlayer(user);
    const b = this.battles.get(ch.id);
    if (!b) throw new BadRequestException('Бой не найден');
    if (b.turn !== 'player') throw new BadRequestException('Сейчас ход врага');

    // start of player's turn: effects tick & cooldown decay
    const tickP = this.tickEffects('player', b);
    b.log.push(...tickP.log);
    if (b.cooldowns) Object.keys(b.cooldowns).forEach(k => { if (b.cooldowns![k] > 0) b.cooldowns![k] -= 1; });
    if (b.player.hp <= 0) { b.turn = 'ended'; this.battles.delete(ch.id); return { state: b, defeat: true }; }

    if (tickP.stunned) {
      b.log.push({ t:'you', action:'stunned' });
    } else {
      // Player action
      let dmg = 0;
      if (action === 'basic') {
        let base = this.randInt(Math.floor(b.player.atk*0.8), Math.floor(b.player.atk*1.2));
        if (Math.random() < b.player.crit) base = Math.floor(base * 1.7);
        dmg = base;
      } else {
        const cd = (b.cooldowns?.[action] ?? 0);
        if (cd > 0) throw new BadRequestException(`Навык на откате: ${cd}`);
        const cs = await this.db.characterSkill.findUnique({ where: { char_id_skill_code: { char_id: ch.id, skill_code: action } }, include: { skill: true } });
        if (!cs) throw new BadRequestException('Навык не изучен');
        dmg = this.calcSkillDamage(cs.skill.code, cs.level, ch, b.player.atk);
        const c = this.skillCooldown(cs.skill.code);
        if (c > 0) { (b.cooldowns ||= {} as any)[cs.skill.code] = c; }
        if (cs.skill.code === 'shield_bash') this.addEffect(b.enemy.effects ||= [], 'stun', 1 + Math.floor(cs.level/3));
        if (cs.skill.code === 'poison') this.addEffect(b.enemy.effects ||= [], 'poison', 3, 1 + Math.floor((cs.level-1)/2));
        if (cs.skill.code === 'ice_spike') this.addEffect(b.enemy.effects ||= [], 'slow', 2, 1 + Math.floor((cs.level-1)/2));
      }
      // apply resists
      const elem = this.skillElement(action as any);
      const out = this.applyResist(dmg, elem, b.enemy);
      b.enemy.hp = Math.max(0, b.enemy.hp - out.dmg);
      b.log.push({ t:'you', action, dmg: out.dmg, resist: out.resisted || 0 });
    }

    // Enemy death
    if (b.enemy.hp <= 0) {
      b.turn = 'ended';
      this.battles.delete(ch.id);
      const loot = await this.dropLoot(ch.id, b.enemy.drops);
      await this.applyRewards(ch.id, b.enemy.xp, b.enemy.gold);
      return { state: b, rewards: { xp: b.enemy.xp, gold: b.enemy.gold, loot } };
    }

    // Enemy turn
    b.turn = 'enemy';
    const tickE = this.tickEffects('enemy', b);
    b.log.push(...tickE.log);
    if (b.enemy.hp <= 0) {
      b.turn = 'ended'; this.battles.delete(ch.id);
      const loot = await this.dropLoot(ch.id, b.enemy.drops);
      await this.applyRewards(ch.id, b.enemy.xp, b.enemy.gold);
      return { state: b, rewards: { xp: b.enemy.xp, gold: b.enemy.gold, loot } };
    }
    if (!tickE.stunned) {
      const enemyAtk = this.atkWithEffects(b.enemy.atk, b.enemy.effects);
      if (Math.random() < b.player.dodge) {
        b.log.push({ t:'enemy', action:'miss' });
      } else {
        const edmg = this.randInt(Math.floor(enemyAtk*0.7), Math.floor(enemyAtk*1.1));
        b.player.hp = Math.max(0, b.player.hp - edmg);
        b.log.push({ t:'enemy', action:'hit', dmg: edmg });
      }
    } else {
      b.log.push({ t:'enemy', action:'stunned' });
    }

    if (b.player.hp <= 0) {
      b.turn = 'ended';
      this.battles.delete(ch.id);
      return { state: b, defeat: true };
    }

    b.turn = 'player';
    return { state: b };
  }

  private calcSkillDamage(code: string, level: number, ch: any, baseAtk: number) {
    const s = (mul: number) => Math.round(baseAtk * mul);
    switch (code) {
      case 'slash':        return s(1.2 + 0.12 * level) + Math.floor(ch.str * 0.5);
      case 'shield_bash':  return s(1.0 + 0.15 * level) + Math.floor(ch.vit * 0.8);
      case 'backstab':     return s(1.0 + 0.2  * level) + this.randInt(0, 5 * level) + Math.floor(ch.agi * 0.4);
      case 'poison':       return s(0.9 + 0.15 * level) + Math.floor(ch.agi * 0.6);
      case 'fireball':     return Math.round((8 + (ch?.int ?? 0) * 1.6) * (1 + 0.22 * level));
      case 'ice_spike':    return Math.round((6 + (ch?.int ?? 0) * 1.4) * (1 + 0.2  * level));
      default:             return Math.round(baseAtk);
    }
  }

  private async computeStats(charId: number) {
    const ch = await this.db.character.findUnique({ where: { id: charId } });
    if (!ch) throw new BadRequestException('Персонаж не найден');
    const eq = await this.db.inventory.findMany({ where: { char_id: charId, equipped: true }, include: { item: { include: { set: true } } } });
    let weaponPower = 0;
    let bonus: any = { hp: 0, atk: 0, str:0, agi:0, int:0, vit:0, dex:0, luck:0 };
    for (const e of eq) {
      if (e.item.slot === 'weapon') weaponPower = Math.max(weaponPower, e.item.power || 0);
      const st = this.parseJSON<any>(e.item.stats) || {};
      for (const k of Object.keys(st)) bonus[k] = (bonus[k] || 0) + Number(st[k] || 0);
    }

    // apply set bonuses
    const setCounts: Record<string, number> = {};
    for (const e of eq) if (e.item.set_code) setCounts[e.item.set_code] = (setCounts[e.item.set_code]||0) + 1;
    for (const e of eq) {
      const s = e.item.set;
      if (!s || !s.bonuses) continue;
      const map = this.parseJSON<Record<string, any>>(s.bonuses) || {};
      const cnt = setCounts[e.item.set_code!] || 0;
      const keys = Object.keys(map).map(k=>Number(k)).filter(n=>!isNaN(n)).sort((a,b)=>a-b);
      for (const need of keys) {
        if (cnt >= need) {
          const b = map[String(need)] || {};
          for (const k of Object.keys(b)) bonus[k] = (bonus[k]||0) + Number(b[k]||0);
        }
      }
    }

    const STR = ch.str + (bonus.str||0);
    const AGI = ch.agi + (bonus.agi||0);
    const INT = ch.int + (bonus.int||0);
    const VIT = ch.vit + (bonus.vit||0);
    const DEX = ((ch as any).dex ?? 0) + (bonus.dex||0);
    const LUCK = ((ch as any).luck ?? 0) + (bonus.luck||0);

    const maxHp = 60 + VIT * 10 + (bonus.hp||0);
    const atk = Math.max(1, Math.floor(STR * 2 + ch.level * 2 + weaponPower + (bonus.atk||0)));
    const crit = Math.min(0.5, 0.05 + LUCK * 0.003);
    const dodge = Math.min(0.35, 0.03 + (AGI + DEX) * 0.002);
    const maxMp = 30 + INT * 5;
    const mp = maxMp;
    return { hp: maxHp, maxHp, atk, crit, dodge, mp, maxMp };
  }

  private rollMonster(zone: Zone, level: number) {
    const m = zone.monsters[this.randInt(0, zone.monsters.length-1)];
    const scaleBase = 1 + Math.max(0, level - zone.minLevel) * 0.1;
    let hp = Math.round(m.baseHp * scaleBase);
    let atk = Math.round(m.baseAtk * scaleBase);
    let xp = Math.round(m.xp * scaleBase);
    let gold = Math.round(m.gold * scaleBase);
    let name = m.name;
    let elite = false;
    if (Math.random() < 0.15) elite = true;
    if (elite) {
      name = `★ ${name}`;
      hp = Math.round(hp * 1.5);
      atk = Math.round(atk * 1.5);
      xp  = Math.round(xp * 1.5);
      gold= Math.round(gold * 1.5);
    }
    return { name, hp, maxHp: hp, atk, xp, gold, drops: m.drops, elite, resists: m.resists };
  }

  private async dropLoot(charId: number, drops: Drop[]) {
    const awarded: string[] = [];
    for (const d of drops) {
      if (Math.random() <= d.chance) {
        const qty = this.randInt(d.min ?? 1, d.max ?? 1);
        const item = await this.db.item.findUnique({ where: { code: d.code } });
        if (!item) continue;
        for (let i=0; i<qty; i++) {
          await this.db.inventory.create({ data: { char_id: charId, item_id: item.id, equipped: false } });
          awarded.push(item.code);
        }
      }
    }
    return awarded;
  }

  private async applyRewards(charId: number, xpGain: number, goldGain: number) {
    const ch = await this.db.character.findUnique({ where: { id: charId } });
    if (!ch) throw new BadRequestException('Персонаж не найден');
    let level = ch.level;
    let exp = Number(ch.exp) + xpGain;
    let pointsAttr = ch.availableAttrPoints;
    let pointsSkill = ch.availableSkillPoints;
    let need = this.needExpFor(level);
    while (exp >= need) {
      exp -= need;
      level += 1;
      pointsAttr += 5;
      pointsSkill += 1;
      need = this.needExpFor(level);
    }
    await this.db.character.update({
      where: { id: charId },
      data: { exp: BigInt(exp), level, gold: BigInt(Number(ch.gold) + goldGain), availableAttrPoints: pointsAttr, availableSkillPoints: pointsSkill } as any
    });
  }

  // --- Reset (not exposed in controller now) ---
  async resetCharacter(user: { tg_id: number }, mode: 'full'|'respec' = 'full') {
    const { character: ch } = await this.ensurePlayer(user);
    await this.db.characterSkill.deleteMany({ where: { char_id: ch.id } });
    await this.db.inventory.updateMany({ where: { char_id: ch.id, equipped: true }, data: { equipped: false } } as any);
    const base = { str: 5, agi: 5, int: 5, vit: 5, dex: 5, luck: 5 };
    const data: any = {
      initialized: false,
      name: null,
      gender: null,
      class: 'warrior',
      str: base.str, agi: base.agi, int: base.int, vit: base.vit, dex: base.dex, luck: base.luck,
      availableAttrPoints: 10,
      availableSkillPoints: 2,
    };
    if (mode === 'full') {
      data.level = 1;
      data.exp = BigInt(0);
      data.energy = 100;
    }
    const updated = await this.db.character.update({ where: { id: ch.id }, data });
    return { ok: true, character: updated, mode };
  }

  private addEffect(effects: any[], code: 'stun'|'poison'|'slow', turns: number, potency = 1) {
    const icons: any = { stun: '💫', poison: '☠️', slow: '🐌' };
    const ex = effects.find(e => e.code === code);
    if (ex) { ex.turns = Math.max(ex.turns, turns); ex.potency = Math.max(ex.potency||1, potency); }
    else effects.push({ code, turns, potency, icon: icons[code] });
  }

  private tickEffects(target: 'player'|'enemy', b: Battle) {
    const arr = (target === 'player') ? (b.player.effects ||= []) : (b.enemy.effects ||= []);
    const outLog: any[] = [];
    let stunned = false;
    for (const e of arr) {
      if (e.code === 'poison' && e.turns > 0) {
        const max = (target === 'player' ? b.player.maxHp : b.enemy.maxHp);
        const dmg = Math.max(1, Math.round(max * 0.06 * (e.potency||1)));
        if (target === 'player') b.player.hp = Math.max(0, b.player.hp - dmg); else b.enemy.hp = Math.max(0, b.enemy.hp - dmg);
        outLog.push({ t: target, action:'poison', dmg });
      }
      if (e.code === 'stun' && e.turns > 0) stunned = true;
      e.turns = Math.max(0, e.turns - 1);
    }
    for (let i = arr.length -1; i >=0; i--) if (arr[i].turns <= 0) arr.splice(i,1);
    return { stunned, log: outLog };
  }

  private atkWithEffects(base: number, effects?: any[]) {
    const slow = (effects||[]).find(e => e.code === 'slow');
    if (slow) return Math.round(base * (1 - 0.2 * (slow.potency||1)));
    return base;
  }

  private skillCooldown(code: string) {
    const map: Record<string, number> = {
      slash: 1,
      shield_bash: 3,
      backstab: 2,
      poison: 2,
      fireball: 2,
      ice_spike: 2,
    };
    return map[code] ?? 0;
  }

  private skillElement(code: string): Element {
    const map: Record<string, Element> = {
      slash: 'physical',
      shield_bash: 'physical',
      backstab: 'physical',
      poison: 'poison',
      fireball: 'fire',
      ice_spike: 'ice',
    };
    return map[code] ?? 'physical';
  }
  private skillCost(code: string) {
    const cost: Record<string, { energy?: number; mp?: number }> = {
      slash: { energy: 2 },
      shield_bash: { energy: 4 },
      backstab: { energy: 3 },
      poison: { energy: 2 },
      fireball: { mp: 8 },
      ice_spike: { mp: 7 },
    };
    return cost[code] || {};
  }
  private applyResist(dmg: number, elem: Element, enemy: { resists?: Partial<Record<Element, number>> }) {
    const r = enemy.resists?.[elem] ?? 0;
    const out = Math.max(1, Math.round(dmg * (1 - Math.max(0, Math.min(0.9, r)))));
    return { dmg: out, resisted: r };
  }

  // --- Mining & Craft ---
  async mine(user: { tg_id: number }) {
    const { character: ch } = await this.ensurePlayer(user);
    const now = new Date();
    if (ch.lastMineAt && now.getTime() - new Date(ch.lastMineAt).getTime() < 30*1000)
      throw new BadRequestException('Ещё на откате');
    const ore = await this.db.item.findUnique({ where: { code: 'iron_ore' } });
    if (!ore) throw new BadRequestException('Нет ресурса');
    await this.db.$transaction([
      this.db.inventory.create({ data: { char_id: ch.id, item_id: ore.id, equipped: false } }),
      this.db.character.update({ where: { id: ch.id }, data: { lastMineAt: now } })
    ]);
    return { ok: true, loot: 'iron_ore' };
  }

  async craft(user: { tg_id: number }, recipeCode: string) {
    const { character: ch } = await this.ensurePlayer(user);
    const recipe = await this.db.recipe.findUnique({ where: { code: recipeCode } });
    if (!recipe) throw new BadRequestException('Рецепт не найден');
    const req = this.parseJSON<Record<string, number>>(recipe.req) || {};
    const inv = await this.db.inventory.findMany({ where: { char_id: ch.id, equipped: false }, include: { item: true } });
    const counts: Record<string, number> = {};
    for (const v of inv) counts[v.item.code] = (counts[v.item.code]||0) + 1;
    for (const [code, need] of Object.entries(req)) {
      if ((counts[code]||0) < Number(need)) throw new BadRequestException('Не хватает ресурсов');
    }
    const toDeleteIds: number[] = [];
    for (const [code, need] of Object.entries(req)) {
      let left = Number(need);
      for (const v of inv) {
        if (left <= 0) break;
        if (v.item.code === code && !toDeleteIds.includes(v.id)) { toDeleteIds.push(v.id); left--; }
      }
    }
    const resultItem = await this.db.item.findUnique({ where: { code: recipe.result_item_code } });
    if (!resultItem) throw new BadRequestException('Результат не найден');
    await this.db.$transaction([
      ...toDeleteIds.map((id)=> this.db.inventory.delete({ where: { id } })),
      this.db.inventory.create({ data: { char_id: ch.id, item_id: resultItem.id, equipped: false } }),
    ] as any);
    return { ok: true, crafted: recipe.result_item_code };
  }

  // --- Simple enemy fight (legacy endpoint) ---
  async startFight(user: { tg_id: number }, enemyName: string) {
    const { character: ch } = await this.ensurePlayer(user);
    const stats = await this.computeStats(ch.id);
    const enemy = { name: enemyName || 'Манекен', hp: 30 + ch.level*5, maxHp: 30 + ch.level*5, atk: 4 + Math.floor(ch.level*1.5), xp: 5 + ch.level*2, gold: 3 + ch.level, drops: [{code:'slime_gel', chance:0.5}], effects: [] as any[] };
    const log: any[] = [{ t:'start', enemy: enemy.name }];
    let php = stats.maxHp;
    let ehp = enemy.hp;
    let turn = 0;
    while (php > 0 && ehp > 0 && turn < 25) {
      const ydmg = this.randInt(Math.floor(stats.atk*0.8), Math.floor(stats.atk*1.2));
      ehp = Math.max(0, ehp - ydmg); log.push({ t:'you', dmg: ydmg });
      if (ehp <= 0) break;
      const edmg = this.randInt(Math.floor(enemy.atk*0.7), Math.floor(enemy.atk*1.1));
      php = Math.max(0, php - edmg); log.push({ t:'enemy', dmg: edmg });
      turn++;
    }
    const win = ehp <= 0 && php > 0;
    let loot: string[] = [];
    if (win) {
      loot = await this.dropLoot(ch.id, enemy.drops);
      await this.applyRewards(ch.id, enemy.xp, enemy.gold);
    }
    return { win, enemy: enemy.name, log, rewards: win ? { xp: enemy.xp, gold: enemy.gold, loot } : undefined };
  }

  // --- Character total stats breakdown ---
  async characterStats(user: { tg_id: number }) {
    const { character: ch } = await this.ensurePlayer(user);
    const eq = await this.db.inventory.findMany({ where: { char_id: ch.id, equipped: true }, include: { item: { include: { set: true } } } });
    const base = { str: ch.str, agi: ch.agi, int: ch.int, vit: ch.vit, dex: (ch as any).dex ?? 0, luck: (ch as any).luck ?? 0, hp: 0, atk: 0 };
    const equip: any = {};
    for (const v of eq) {
      const st = this.parseJSON<any>(v.item.stats) || {};
      for (const k of Object.keys(st)) equip[k] = (equip[k]||0) + Number(st[k]||0);
    }
    const setCounts: Record<string, number> = {};
    for (const v of eq) if (v.item.set_code) setCounts[v.item.set_code] = (setCounts[v.item.set_code]||0) + 1;
    const setBon: any = {};
    for (const v of eq) {
      const s = v.item.set;
      if (!s || !s.bonuses) continue;
      const map = this.parseJSON<Record<string, any>>(s.bonuses) || {};
      const cnt = setCounts[v.item.set_code!] || 0;
      for (const need of Object.keys(map)) {
        if (cnt >= Number(need)) {
          const b = map[need]||{};
          for (const k of Object.keys(b)) setBon[k] = (setBon[k]||0) + Number(b[k]||0);
        }
      }
    }
    const totals: any = {};
    for (const k of new Set([...Object.keys(base), ...Object.keys(equip), ...Object.keys(setBon)])) {
      totals[k] = Number((base as any)[k]||0) + Number(equip[k]||0) + Number(setBon[k]||0);
    }
    return { base, equip, setBonuses: setBon, totals };
  }

  // --- Rest to recover energy (cooldown 5 min) ---
  async rest(user: { tg_id: number }) {
    const { character: ch } = await this.ensurePlayer(user);
    const now = new Date();
    const last = ch.lastRestAt ? new Date(ch.lastRestAt) : new Date(0);
    if (now.getTime() - last.getTime() < 5*60*1000) throw new BadRequestException('Отдых ещё на откате');
    const gain = 10;
    const upd = await this.db.character.update({ where: { id: ch.id }, data: { lastRestAt: now, energy: ch.energy + gain } });
    return { ok: true, energy: upd.energy };
  }

  // --- World Boss (file-persistent) ---
  private wbFile() { return require('path').resolve(this.ensureDataDir(), 'worldboss.json'); }
  private getWorldBossConfig() {
    return [
      { code: 'ancient_slime', name: 'Древний Слизень', maxHp: 1200, atk: 25, rewardXp: 250, rewardGold: 180, respawnSec: 60*20, resists: { poison: 0.7 } },
      { code: 'sand_tyrant', name: 'Песчаный Тиран', maxHp: 1800, atk: 35, rewardXp: 380, rewardGold: 260, respawnSec: 60*30, resists: { physical: 0.2, fire: 0.1 } },
    ];
  }
  private ensureWbState() {
    const file = this.wbFile();
    const now = Date.now();
    let st = this.readJson(file, null);
    if (!st) {
      const cfg = this.getWorldBossConfig()[0];
      st = { boss: cfg.code, hp: cfg.maxHp, maxHp: cfg.maxHp, atk: cfg.atk, rewardXp: cfg.rewardXp, rewardGold: cfg.rewardGold, resists: cfg.resists||{}, alive: true, nextSpawnAt: 0, contrib: {} };
      this.writeJson(file, st);
    } else {
      if (!st.alive && now >= (st.nextSpawnAt || 0)) {
        const list = this.getWorldBossConfig();
        const cfg = list[Math.floor(Math.random()*list.length)];
        st = { boss: cfg.code, hp: cfg.maxHp, maxHp: cfg.maxHp, atk: cfg.atk, rewardXp: cfg.rewardXp, rewardGold: cfg.rewardGold, resists: cfg.resists||{}, alive: true, nextSpawnAt: 0, contrib: {} };
        this.writeJson(file, st);
        this.tgNotify(`⚔️ Мировой босс появился: ${cfg.name} (${cfg.code}) HP:${cfg.maxHp}`);
      }
    }
    return st;
  }
  async worldBossStatus() {
    const st = this.ensureWbState();
    return { boss: st.boss, hp: st.hp, maxHp: st.maxHp, alive: st.alive, nextSpawnAt: st.nextSpawnAt || 0 };
  }
  async worldBossAttack(user: { tg_id: number }, action: string) {
    const { character: ch } = await this.ensurePlayer(user);
    let st = this.ensureWbState();
    if (!st.alive) return { ...st, note: 'Босс отсутствует' };
    const stats = await this.computeStats(ch.id);
    let base = this.randInt(Math.floor(stats.atk*0.9), Math.floor(stats.atk*1.3));
    if (action && action !== 'basic') base = Math.floor(base * 1.2);
    const elem: Element = action==='fireball'?'fire': action==='poison'?'poison': action==='ice_spike'?'ice':'physical';
    const out = this.applyResist(base, elem, { resists: st.resists || {} });
    const dmg = out.dmg;
    st.hp = Math.max(0, st.hp - dmg);
    st.contrib[String(ch.id)] = (Number(st.contrib[String(ch.id)]) || 0) + dmg;
    this.writeJson(this.wbFile(), st);

    let rewards: any = null;
    if (st.hp <= 0) {
      const sum = Object.values(st.contrib).map((v:any)=>Number(v)||0).reduce((a:number,b:number)=>a+b,0) || 1;
      for (const [cid, dealt] of Object.entries(st.contrib)) {
        const share = (Number(dealt) / sum);
        const xp = Math.max(1, Math.floor(st.rewardXp * share));
        const gold = Math.max(1, Math.floor(st.rewardGold * share));
        const win = await this.db.character.findUnique({ where: { id: Number(cid) } });
        if (win) {
          await this.db.character.update({ where: { id: win.id }, data: { exp: { increment: BigInt(xp) } as any, gold: BigInt(Number(win.gold) + gold) } as any });
        }
      }
      const cfg = this.getWorldBossConfig().find((c:any)=>c.code===st.boss) || this.getWorldBossConfig()[0];
      st.alive = false;
      st.nextSpawnAt = Date.now() + (cfg.respawnSec*1000);
      this.writeJson(this.wbFile(), st);
      this.tgNotify(`🏆 Мировой босс повержен: ${cfg.name}. Следующее появление через ${Math.floor(cfg.respawnSec/60)} мин.`);
      rewards = { xp: st.rewardXp, gold: st.rewardGold, shared: true };
    }
    return { ok: true, boss: st.boss, hp: st.hp, maxHp: st.maxHp, dealt: dmg, rewards, nextSpawnAt: st.nextSpawnAt || 0 };
  }

  // --- Shop via market endpoints ---
  async marketListings() {
    const items = await this.db.item.findMany({ where: { code: { in: SHOP.map(s=>s.code) } } });
    return items.map(it => {
      const price = SHOP.find(s=>s.code===it.code)?.price ?? 999;
      return { id: it.id, code: it.code, name: it.name, price, power: it.power, slot: it.slot };
    });
  }

  async marketBuy(user: { tg_id: number }, listingItemId: number) {
    const { character: ch } = await this.ensurePlayer(user);
    const it = await this.db.item.findUnique({ where: { id: listingItemId } });
    if (!it) throw new BadRequestException('Товар не найден');
    const price = SHOP.find(s=>s.code===it.code)?.price;
    if (!price) throw new BadRequestException('Товар недоступен');
    if (Number(ch.gold) < price) throw new BadRequestException('Не хватает золота');
    await this.db.$transaction([
      this.db.character.update({ where: { id: ch.id }, data: { gold: BigInt(Number(ch.gold) - price) } }),
      this.db.inventory.create({ data: { char_id: ch.id, item_id: it.id, equipped: false } }),
    ]);
    return { ok: true };
  }

  // --- Arena (PvE vs bot) ---
  async arenaFight(user: { tg_id: number }) {
    const { character: ch } = await this.ensurePlayer(user);
    const stats = await this.computeStats(ch.id);
    const bot = { name: 'Гладиатор ИИ', hp: 40 + ch.level*8, maxHp: 40 + ch.level*8, atk: Math.max(4, Math.floor(stats.atk*0.9)) };
    const log: any[] = [];
    let php = stats.maxHp;
    let ehp = bot.hp;
    let turn = 0;
    while (php > 0 && ehp > 0 && turn < 30) {
      const ydmg = this.randInt(Math.floor(stats.atk*0.8), Math.floor(stats.atk*1.1));
      ehp = Math.max(0, ehp - ydmg); log.push({ t:'you', dmg: ydmg });
      if (ehp <= 0) break;
      const edmg = this.randInt(Math.floor(bot.atk*0.8), Math.floor(bot.atk*1.1));
      php = Math.max(0, php - edmg); log.push({ t:'enemy', dmg: edmg });
      turn++;
    }
    const win = ehp <= 0 && php > 0;
    const reward = win ? (10 + ch.level * 2) : 3;
    await this.db.character.update({ where: { id: ch.id }, data: { gold: BigInt(Number(ch.gold) + reward) } });
    return { win, reward, log: log.slice(-20) };
  }

  // --- Equip / Unequip ---
  async equip(user: { tg_id: number }, inventoryId: number) {
    const { character: ch } = await this.ensurePlayer(user);
    const slot = await this.db.inventory.findUnique({ where: { id: inventoryId }, include: { item: true } });
    if (!slot || slot.char_id !== ch.id) throw new BadRequestException('Нет предмета');
    if (!slot.item.slot) throw new BadRequestException('Нельзя экипировать');
    await this.db.$transaction([
      this.db.inventory.updateMany({ where: { char_id: ch.id, equipped: true, item: { slot: slot.item.slot } }, data: { equipped: false } } as any),
      this.db.inventory.update({ where: { id: inventoryId }, data: { equipped: true } }),
    ]);
    return { ok: true };
  }

  async unequip(user: { tg_id: number }, inventoryId: number) {
    const { character: ch } = await this.ensurePlayer(user);
    const it = await this.db.inventory.findUnique({ where: { id: inventoryId } });
    if (!it || it.char_id !== ch.id) throw new BadRequestException('Нет предмета');
    await this.db.inventory.update({ where: { id: inventoryId }, data: { equipped: false } });
    return { ok: true };
  }

  // --- Leaderboard & profile ---
  async leaderboard(limit = 100) {
    const chars = await this.db.character.findMany({ orderBy: [{ level: 'desc' }, { exp: 'desc' }], take: limit, select: { id: true, name: true, level: true, exp: true, class: true } });
    return chars.map((c,i)=> ({ rank: i+1, ...c, score: Number(c.exp) + c.level*1000 }));
  }

  async profile(id: number) {
    const ch = await this.db.character.findUnique({ where: { id }, include: { user: true } as any });
    if (!ch) throw new BadRequestException('Персонаж не найден');
    const inv = await this.db.inventory.findMany({ where: { char_id: id }, include: { item: true } });
    const skills = await this.db.characterSkill.findMany({ where: { char_id: id }, include: { skill: true } });
    return { character: ch, inventory: inv, skills };
  }

  // --- Dailies ---
  async claimDaily(user: { tg_id: number }) {
    const { character: ch } = await this.ensurePlayer(user);
    const today = new Date();
    if (ch.lastDailyAt && today.toDateString() === new Date(ch.lastDailyAt).toDateString())
      throw new BadRequestException('Уже получено сегодня');
    const rewardGold = 20;
    const rewardEnergy = 10;
    await this.db.character.update({ where: { id: ch.id }, data: { lastDailyAt: today, gold: BigInt(Number(ch.gold) + rewardGold), energy: ch.energy + rewardEnergy } });
    return { ok: true, gold: rewardGold, energy: rewardEnergy };
  }

  // --- Guilds ---
  async guildCreate(user: { tg_id: number }, name: string, tag: string) {
    const { character: ch } = await this.ensurePlayer(user);
    if ((ch as any).guild_id) throw new BadRequestException('Вы уже в гильдии');
    name = (name||'').trim(); tag = (tag||'').trim().toUpperCase();
    if (name.length < 3 || tag.length < 2 || tag.length > 5) throw new BadRequestException('Некорректные имя/тег');
    const existing = await this.db.guild.findFirst({ where: { OR: [{ name }, { tag }] } });
    if (existing) throw new BadRequestException('Имя/тег заняты');
    const g = await this.db.guild.create({ data: { name, tag, leader_id: ch.id } as any });
    await this.db.$transaction([
      this.db.guildMember.create({ data: { guild_id: g.id, char_id: ch.id, role: 'leader' } } as any),
      this.db.character.update({ where: { id: ch.id }, data: { guild_id: g.id } } as any),
    ]);
    return { ok: true, guild: g };
  }

  async guildJoin(user: { tg_id: number }, guildId: number) {
    const { character: ch } = await this.ensurePlayer(user);
    if ((ch as any).guild_id) throw new BadRequestException('Вы уже в гильдии');
    const g = await this.db.guild.findUnique({ where: { id: guildId } });
    if (!g) throw new BadRequestException('Гильдия не найдена');
    await this.db.$transaction([
      this.db.guildMember.create({ data: { guild_id: g.id, char_id: ch.id, role: 'member' } } as any),
      this.db.character.update({ where: { id: ch.id }, data: { guild_id: g.id } } as any),
    ]);
    return { ok: true };
  }

  async guildLeave(user: { tg_id: number }) {
    const { character: ch } = await this.ensurePlayer(user);
    if (!(ch as any).guild_id) throw new BadRequestException('Вы не в гильдии');
    await this.db.$transaction([
      this.db.guildMember.deleteMany({ where: { char_id: ch.id } }),
      this.db.character.update({ where: { id: ch.id }, data: { guild_id: null } } as any),
    ]);
    return { ok: true };
  }

  async guildList(q: string, take: number) {
    const guilds = await this.db.guild.findMany({ where: q ? { OR: [{ name: { contains: q } }, { tag: { contains: q } }] } : {}, take, orderBy: { id: 'desc' } });
    const counts = await this.db.guildMember.groupBy({ by: ['guild_id'], _count: { guild_id: true } } as any).catch(()=>[]);
    const map: Record<number, number> = {};
    for (const c of counts as any[]) map[c.guild_id] = c._count.guild_id;
    return guilds.map(g => ({ ...g, members: map[g.id] ?? 0 }));
  }

  // --- Auctions (in-memory) ---
  auctionList() {
    const now = Date.now();
    const list = [...this.auctions.values()].map(a => ({ ...a, timeLeftSec: Math.max(0, Math.floor((a.endsAt - now)/1000)) }));
    return list.sort((a,b)=> b.endsAt - a.endsAt);
  }

  // --- Helpers ---
  private async ensurePlayer(user: { tg_id: number; username?: string }, ref?: string) {
    let u = await this.db.user.findUnique({ where: { tg_id: BigInt(user.tg_id) } });
    if (!u) u = await this.db.user.create({ data: { tg_id: BigInt(user.tg_id), username: user.username, referralCode: this.randRef(), referredBy: ref || null } });
    let ch = await this.db.character.findFirst({ where: { user_id: u.id } });
    if (!ch) {
      const base = CLASS_BASE['warrior'];
      ch = await this.db.character.create({ data: { user_id: u.id, class: 'warrior', str: base.str, agi: base.agi, int: base.int, vit: base.vit, dex: base.dex, luck: base.luck, initialized: false, availableAttrPoints: 10, availableSkillPoints: 2 } as any });
    }
    return { user: u, character: ch };
  }

  private ensureDataDir() {
    const fs = require('fs'); const path = require('path');
    const dir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    return dir;
  }
  private readJson(file: string, fallback: any) {
    const fs = require('fs');
    try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return fallback; }
  }
  private writeJson(file: string, data: any) {
    const fs = require('fs');
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  }

  private tgNotify(text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chat) return;
    const data = JSON.stringify({ chat_id: chat, text });
    const opts: https.RequestOptions = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };
    const req = https.request(opts, res => { res.on('data', ()=>{}); });
    req.on('error', ()=>{});
    req.write(data); req.end();
  }

  private parseJSON<T=any>(s: string | null | undefined): T | null { if (!s) return null; try { return JSON.parse(s) as T; } catch { return null; } }
  private needExpFor(level: number) { return 100 + (level - 1) * 20; }
  private randRef() { return Math.random().toString(36).slice(2, 8); }
  private randInt(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
}
