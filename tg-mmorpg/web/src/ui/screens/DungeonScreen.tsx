import React, { useEffect, useState } from 'react'
import { api } from '../../lib/api'

type BattleState = any

export default function DungeonScreen(){
  const [zones,setZones]=useState<any[]>([])
  const [state,setState]=useState<BattleState|null>(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)

  useEffect(()=>{ api('/fight/zones').then(setZones) },[])

  const start = async (zoneId:string)=>{
    try{ setLoading(true); setError(null); const r = await api('/fight/start',{ zoneId }); setState(r.state) }
    catch(e:any){ setError(e.message || 'Ошибка'); } finally{ setLoading(false) }
  }

  const turn = async (action:string)=>{
    try{
      setLoading(true); setError(null);
      const r = await api('/fight/turn',{ action });
      setState(r.state);
      if(r.rewards){ alert(`Награда: +${r.rewards.xp} XP, +${r.rewards.gold} зол.`) }
      if(r.defeat){ alert('Поражение!'); }
    } catch(e:any){
      setError(e.message || 'Ошибка');
    } finally{ setLoading(false) }
  }

  return (
    <section className="max-w-3xl mx-auto">
      {!state && (
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Локации подземелий</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {zones.map(z => (
              <button key={z.id} className="btn btn-primary" onClick={()=>start(z.id)}>{z.name}</button>
            ))}
          </div>
        </div>
      )}
      {state && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>Враг: <b>{state.enemy.name}</b> HP {state.enemy.hp}/{state.enemy.maxHp}</div>
            <div>Вы: HP {state.player.hp}/{state.player.maxHp}</div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn" disabled={loading || state.turn!=='player'} onClick={()=>turn('basic')}>Обычная атака</button>
            <button className="btn" disabled={loading || state.turn!=='player'} onClick={()=>turn('slash')}>Мощный удар</button>
            <button className="btn" disabled={loading || state.turn!=='player'} onClick={()=>turn('backstab')}>Удар в спину</button>
            <button className="btn" disabled={loading || state.turn!=='player'} onClick={()=>turn('fireball')}>Огненный шар</button>
          </div>
          <div className="text-xs opacity-80 max-h-48 overflow-auto pr-2">
            {state.log.slice(-30).map((l:any,i:number)=>(<div key={i}>{l.t==='you'?'Вы':l.t==='enemy'?'Враг':'*'}: {l.action} {typeof l.dmg==='number' ? `(${l.dmg})` : ''}</div>))}
          </div>
          {state.turn==='ended' && <button className="btn btn-primary" onClick={()=> setState(null)}>Выйти</button>}
        </div>
      )}
      {error && <div className="text-danger mt-3">{error}</div>}
    </section>
  )
}