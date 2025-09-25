import { simulateBattle } from './combat.js'
import { db } from './store.js'

function needExp(l){ return 20 + l*10 }

export function startBattle(userId, stageId){
  const ch = [...db.characters.values()].find(c=>c.user_id===userId)
  if(!ch) return { error: 'no_char' }
  const stage = db.stages.flatMap(l=>l.stages).find(s=>s.id===stageId)
  if(!stage) return { error: 'stage_not_found' }
  if(ch.energy < stage.energy_cost) return { error: 'no_energy' }
  ch.energy -= stage.energy_cost
  return { ok:true }
}

export function resolveBattle(userId, stageId){
  const ch = [...db.characters.values()].find(c=>c.user_id===userId)
  const stage = db.stages.flatMap(l=>l.stages).find(s=>s.id===stageId)
  const { result, turns, rewards, replay } = simulateBattle(ch, stage)
  if(result==='win'){ ch.exp += 12*stage.difficulty }
  while(ch.exp >= needExp(ch.level)){ ch.exp -= needExp(ch.level); ch.level++; ch.max_energy+=2 }
  return { result, turns, rewards, replay, updatedCharacter: ch }
}
