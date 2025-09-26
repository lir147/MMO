
export type Effect = { code: 'stun'|'poison'|'slow'; turns: number; potency?: number; icon?: string };
export type BattleSide = { hp: number; maxHp: number; atk: number; crit?: number; dodge?: number; effects?: Effect[]; mp?: number; maxMp?: number };
export type BattleState = {
  player: BattleSide;
  enemy: BattleSide & { name?: string; };
  zoneId: string;
  turn: 'player'|'enemy'|'ended';
  log: any[];
  cooldowns?: Record<string, number>;
  playerEnergy?: number;
};
};
