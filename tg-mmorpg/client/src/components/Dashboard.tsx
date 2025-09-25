import { useEffect, useMemo, useState } from 'react'
import { Location } from '../types'
import { getStages, createBattle } from '../api'
import BattleManual from './BattleManual'
import { Bar } from '../lib/ui'
import Sheet from './Sheet'
import Raid from './Raid'
import Leaderboard from './Leaderboard'

export default function Dashboard({ token, character, onUpdate }:{ token:string; character:any; onUpdate:(c:any)=>void }){
  const [locations, setLocations] = useState<Location[]>([])
  const [battle,setBattle] = useState<any|null>(null)
  useEffect(()=>{ getStages(token).then(d=>setLocations(d.locations)) }, [token])
  const energyPct = useMemo(()=> Math.round(character.energy/character.max_energy*100), [character])

  return (
    <div className="grid gap-4">
      <div className="card grid gap-2">
        <div className="title">{character.name} • {character.class} • Lv.{character.level}</div>
        <div className="text-sm">Энергия</div>
        <Bar value={energyPct} />
      </div>

      <Sheet token={token} />
      <Raid token={token} />
      <Leaderboard />

      {locations.map(loc=> (
        <div key={loc.id} className="card">
          <div className="title">{loc.name}</div>
          <div className="text-xs opacity-70">{loc.biome}</div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {loc.stages.map(s=> (
              <button key={s.id} className="btn h-16 flex-col text-center" onClick={async ()=>{
                const st = await createBattle(token, s.id)
                if(st.error){ alert(st.error==='no_energy' ? 'Недостаточно энергии' : 'Ошибка'); return }
                setBattle(st)
              }}>
                <div className="text-sm">{s.name}</div>
                <div className="text-xs opacity-70">Сложн. {s.difficulty} • Энергия {s.energy_cost}</div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {battle && <BattleManual token={token} state={battle} onUpdate={(b)=>{ setBattle(b); if(b.over){ onUpdate((prev:any)=>({...prev})) } }} onClose={()=>setBattle(null)} />}
    </div>
  )
}
