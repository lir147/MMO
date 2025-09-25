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
export async function startBattle(token:string, stageId:number){
  const r = await fetch(API+'/me/battles/start', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ stageId }) })
  return r.json()
}
export async function resolveBattle(token:string, stageId:number){
  const r = await fetch(API+'/me/battles/resolve', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ stageId }) })
  return r.json()
}
export async function wsUrl(uid:number, username:string){
  return `${API.replace('http','ws')}/ws?uid=${uid}&u=${encodeURIComponent(username||'player')}`
}
export async function getBoss(){ const r = await fetch(API+'/world/boss/current'); return r.json() }
export async function hitBoss(token:string, dmg:number){ const r = await fetch(API+'/me/world/boss/hit',{ method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ dmg })}); return r.json() }
export async function getContrib(){ const r=await fetch(API+'/world/boss/contrib'); return r.json() }
export async function getListings(){ const r=await fetch(API+'/market/listings'); return r.json() }
