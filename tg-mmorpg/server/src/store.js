export const db = {
  users: new Map(),
  characters: new Map(),
  items: new Map(),
  battles: new Map(),
  raids: new Map(), // active raids by code
  stages: [],
  leaderboard: new Map(), // uid -> { level, wins, dmg }
}
let seq = { user: 1, char: 1, item: 1, battle: 1 }
export const nextId = (key) => seq[key]++

export function seedContent(){
  const s = []
  let sid = 1
  s.push({ id: 1, name: 'Лес Эх Грин', biome: 'forest', stages:[
    { id: sid++, name:'Полянка', difficulty: 1, energy_cost: 5 },
    { id: sid++, name:'Тропинка', difficulty: 2, energy_cost: 8 }
  ]})
  s.push({ id: 2, name: 'Пепельные Пещеры', biome: 'cave', stages:[
    { id: sid++, name:'Гроты', difficulty: 3, energy_cost: 12 },
    { id: sid++, name:'Логово', difficulty: 4, energy_cost: 15 }
  ]})
  db.stages = s
  // One default raid
  db.raids.set('ancient_treant', { code:'ancient_treant', name:'Древний Треант', max_hp: 200000, hp: 200000, contributions: new Map() })
}
seedContent()
