import { useEffect, useMemo, useState } from 'react'
import { Location } from '../types'
import { getStages, startBattle, resolveBattle } from '../api'

export default function Dashboard({ token, character, onUpdate }:{ token:string; character:any; onUpdate:(c:any)=>void }){
  const [locations, setLocations] = useState<Location[]>([])
  useEffect(()=>{ getStages(token).then(d=>setLocations(d.locations)) }, [token])
  const energyPct = useMemo(()=> Math.round(character.energy/character.max_energy*100), [character])
  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{border:'1px solid #ddd', padding:12, borderRadius:10}}>
        <div style={{fontWeight:600}}>{character.name} • {character.class} • Lv.{character.level}</div>
        <div>Энергия: {character.energy}/{character.max_energy} ({energyPct}%)</div>
      </div>
      {locations.map(loc=> (
        <div key={loc.id} style={{border:'1px solid #ddd', padding:12, borderRadius:10}}>
          <div style={{fontWeight:600}}>{loc.name} — {loc.biome}</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:8}}>
            {loc.stages.map(s=> (
              <button key={s.id} style={{border:'1px solid #ccc', padding:10, borderRadius:8}} onClick={async ()=>{
                const st = await startBattle(token, s.id)
                if(st.error){ alert('Ошибка: '+st.error); return }
                const rs = await resolveBattle(token, s.id)
                alert(`Бой: ${rs.result}. Ходов: ${rs.turns}. Награды: ` + JSON.stringify(rs.rewards))
                onUpdate(rs.updatedCharacter)
              }}>
                Сложн. {s.difficulty}<br/>Энергия {s.energy_cost}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
