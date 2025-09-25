export const db = {
  users: new Map(),
  characters: new Map(),
  guilds: new Map(),
  guildMembers: new Map(), // `${guildId}:${userId}` -> role
  listings: new Map(),
  world: { boss: null, bossDamage: new Map() },
  stages: []
}
let seq = { user: 1, char: 1, guild: 1, list: 1, battle: 1 }
export const nextId = (key) => seq[key]++

export function seedContent(){
  const s = []
  let sid = 1
  s.push({ id: 1, name: 'Лес Эх Грин', biome: 'forest', stages:[
    { id: sid++, difficulty: 1, energy_cost: 5 },
    { id: sid++, difficulty: 2, energy_cost: 8 },
    { id: sid++, difficulty: 3, energy_cost: 11 }
  ]})
  s.push({ id: 2, name: 'Пепельные Пещеры', biome: 'cave', stages:[
    { id: sid++, difficulty: 2, energy_cost: 8 },
    { id: sid++, difficulty: 3, energy_cost: 12 },
    { id: sid++, difficulty: 4, energy_cost: 15 }
  ]})
  db.stages = s
}
seedContent()
