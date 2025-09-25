const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function init(){
  const r = await fetch(API+'/auth/telegram/init', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ initData: '' }) })
  return r.json()
}
export async function createChar(token:string, name:string, klass:'warrior'|'mage'|'ranger'){
  const r = await fetch(API+'/me/characters', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ name, class: klass }) })
  return r.json()
}
export async function getStages(token:string){
  const r = await fetch(API+'/me/stages', { headers:{ Authorization:`Bearer ${token}` } })
  return r.json()
}
export async function getMe(token:string){
  const r = await fetch(API+'/me/character', { headers:{ Authorization:`Bearer ${token}` } })
  return r.json()
}
export async function equip(token:string, itemId:number){
  const r = await fetch(API+'/me/inventory/equip', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ itemId }) })
  return r.json()
}
export async function allocateStats(token:string, delta:{str:number;int:number;agi:number}){
  const r = await fetch(API+'/me/stats/allocate', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(delta) })
  return r.json()
}
export async function createBattle(token:string, stageId:number){
  const r = await fetch(API+'/me/battles/create', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ stageId }) })
  return r.json()
}
export async function action(token:string, battleId:number, skill:string){
  const r = await fetch(API+'/me/battles/action', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ battleId, skill }) })
  return r.json()
}
export async function getRaid(){ const r = await fetch(API+'/raid'); return r.json() }
export async function hitRaid(token:string){ const r = await fetch(API+'/me/raid/hit', { method:'POST', headers:{ Authorization:`Bearer ${token}` } }); return r.json() }
export async function getLeaderboard(){ const r = await fetch(API+'/leaderboard'); return r.json() }
