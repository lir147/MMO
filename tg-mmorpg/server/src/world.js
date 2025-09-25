import { db } from './store.js'

export function currentBoss(){
  if(!db.world.boss){
    db.world.boss = { id: 1, code: 'ancient_treant', name: 'Древний Треант', max_hp: 100000, hp: 100000 }
  }
  return db.world.boss
}

export function hitBoss(userId, dmg){
  const boss = currentBoss()
  const real = Math.max(1, Math.min(dmg, boss.hp))
  boss.hp -= real
  const prev = db.world.bossDamage.get(userId) || 0
  db.world.bossDamage.set(userId, prev + real)
  return { boss, dealt: real, totalByUser: prev + real }
}

export function contributions(){
  return [...db.world.bossDamage.entries()].map(([userId, dmg])=>({ userId, dmg })).sort((a,b)=>b.dmg-a.dmg)
}
