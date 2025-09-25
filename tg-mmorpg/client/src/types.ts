export type Character = { id:number; name:string; class:'warrior'|'mage'|'ranger'; level:number; exp:number; energy:number; max_energy:number; str:number; int:number; agi:number; stat_points:number; weapon_id:number|null; armor_id:number|null }
export type Stage = { id:number; name:string; difficulty:number; energy_cost:number }
export type Location = { id:number; name:string; biome:string; stages: Stage[] }
export type Item = { id:number; name:string; type:'weapon'|'armor'; rarity:string; atk:number; def:number; equipped?:boolean }
export type Quest = { id:string; name:string; goal:number; progress:number; reward:any; claimed:boolean }
