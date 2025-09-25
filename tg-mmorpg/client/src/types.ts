export type Character = { id:number; name:string; class:'warrior'|'mage'|'ranger'; level:number; exp:number; energy:number; max_energy:number }
export type Stage = { id:number; difficulty:number; energy_cost:number }
export type Location = { id:number; name:string; biome:string; stages: Stage[] }
