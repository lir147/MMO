import { db, nextId } from './store.js'

export function createGuild(userId, name){
  const id = nextId('guild')
  db.guilds.set(id, { id, name, created_at: new Date().toISOString() })
  db.guildMembers.set(`${id}:${userId}`, 'leader')
  return db.guilds.get(id)
}

export function getGuild(id){
  const g = db.guilds.get(Number(id))
  if(!g) return null
  const members = [...db.guildMembers.entries()].filter(([k])=>k.startsWith(`${g.id}:`)).map(([k,role])=>({ userId: Number(k.split(':')[1]), role }))
  return { ...g, members }
}
