import { db } from './store.js'

function needExp(l){ return 20 + l*10 }
function difficulty(stage){ return stage.difficulty }
function winChance(level, diff){ const base = 0.55 + (level - diff)*0.07; return Math.max(0.2, Math.min(0.9, base)) }

export function startBattle(userId, stageId){
  const ch = [...db.characters.values()].find(c=>c.user_id===userId)
  if(!ch) return { error: 'no_char' }
  const stage = db.stages.flatMap(l=>l.stages).find(s=>s.id===stageId)
  if(!stage) return { error: 'stage_not_found' }
  if(ch.energy < stage.energy_cost) return { error: 'no_energy' }
  ch.energy -= stage.energy_cost
  return { snapshot: { you: { level: ch.level }, enemies:[{hp:50*difficulty(stage)}] } }
}

export function resolveBattle(userId, stageId){
  const ch = [...db.characters.values()].find(c=>c.user_id===userId)
  const stage = db.stages.flatMap(l=>l.stages).find(s=>s.id===stageId)
  const d = difficulty(stage)
  const result = Math.random() < winChance(ch.level, d) ? 'win' : 'lose'
  const turns = Math.floor(3 + Math.random()*4)
  if(result==='win') ch.exp += 10*d
  while(ch.exp >= needExp(ch.level)) { ch.exp -= needExp(ch.level); ch.level++; ch.max_energy+=2; }
  const rewards = result==='win' ? { gold: 5*d, mats: 1 } : {}
  return { result, turns, rewards, updatedCharacter: ch }
}
