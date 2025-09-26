
import React, { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function ProfileScreen({ me, onChanged }:{ me:any; onChanged: ()=>void }){
  const [skills,setSkills]=useState<any[]>([])
  const [busy,setBusy]=useState(false); const [err,setErr]=useState<string|null>(null)

  const loadSkills=()=> api('/skills/list').then(setSkills)
  useEffect(()=>{ loadSkills() },[])

  const alloc = async (k:string)=>{
    try{ setBusy(true); setErr(null); await api('/character/attrs/allocate',{ [k]: 1 }); await onChanged(); } catch(e:any){ setErr(e.message) } finally{ setBusy(false) }
  }
  const learn = async (code:string)=>{
    try{ setBusy(true); setErr(null); await api('/skills/learn',{ code }); await loadSkills(); await onChanged(); } catch(e:any){ setErr(e.message) } finally{ setBusy(false) }
  }

  return (
    <section className="card p-4">
      <h2 className="text-lg font-semibold mb-2">Профиль</h2>
      <div className="mb-3">Ник: <b>{me.character.name || '—'}</b> · Класс: <b>{me.character.class}</b> · Пол: <b>{me.character.gender || '—'}</b></div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="p-3 rounded bg-white/5">
          <div className="font-medium mb-2">Характеристики (осталось: {me.character.availableAttrPoints})</div>
          {['str','agi','int','vit','dex','luck'].map(k=> (
            <div key={k} className="flex items-center justify-between py-1">
              <div className="uppercase">{k}</div>
              <div className="flex items-center gap-2">
                <b>{me.character[k]}</b>
                <button className="btn" disabled={busy || me.character.availableAttrPoints<=0} onClick={()=>alloc(k)}>+1</button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 rounded bg-white/5">
          <div className="font-medium mb-2">Навыки (SP: {me.character.availableSkillPoints})</div>
          <div className="space-y-2">
            {skills.map(s => (
              <div key={s.code} className="p-2 rounded bg-black/30 border border-white/10 flex items-center justify-between">
                <div>
                  <div>{s.name} {s.cls && <span className="text-xs text-white/50">[{s.cls}]</span>}</div>
                  <div className="text-xs text-white/60">{s.description}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm">Lv {s.learnedLevel}/{s.maxLevel}</div>
                  <button className="btn btn-primary" disabled={busy || s.learnedLevel>=s.maxLevel || me.character.availableSkillPoints<=0} onClick={()=>learn(s.code)}>Учить</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {err && <div className="mt-3 text-danger">{err}</div>}
    </section>
  )
}
