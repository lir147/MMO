
import React, { useEffect, useState } from 'react'
import { api, fmt } from '../../lib/api'
import { I } from '../components/Icon'
import Modal from '../components/Modal'

export default function LeaderboardScreen(){
  const [metric,setMetric]=useState<'rating'|'level'|'gold'>('rating')
  const [rows,setRows]=useState<any[]>([])
  const [profile,setProfile]=useState<any|null>(null)

  const load=()=> api('/leaderboard?metric='+metric).then(setRows)
  useEffect(()=>{ load() },[metric])

  const openProfile = async (id:number)=>{
    const p = await api('/profile/'+id)
    setProfile(p)
  }

  return (
    <section className="card p-4">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><I.ListOrdered/> Рейтинги</h2>
      <div className="mb-3 flex gap-2">
        <select className="px-3 py-2 rounded-lg bg-black/30 border border-white/10" value={metric} onChange={e=>setMetric(e.target.value as any)}>
          <option value="rating">Рейтинг</option>
          <option value="level">Уровень</option>
          <option value="gold">Золото</option>
        </select>
      </div>
      <div className="space-y-2">
        {rows.map((r,i)=> (
          <div key={r.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="text-sm">#{i+1} · ID {r.id}</div>
            <div className="text-sm">Lvl {r.level} · Rating {r.rating} · Gold {fmt(r.gold)}</div>
            <button className="btn" onClick={()=>openProfile(r.id)}><I.UserCircle2/> Профиль</button>
          </div>
        ))}
        {!rows.length && <div className="text-white/50">Пусто</div>}
      </div>

      <Modal open={!!profile} onClose={()=>setProfile(null)} title="Профиль">
        {profile && (
          <div className="space-y-2">
            <div className="text-white/80">Игрок: @{profile.user?.username || 'unknown'}</div>
            <div className="text-white/60 text-sm">Класс {profile.character.class} · Ур. {profile.character.level} · Рейтинг {profile.character.rating}</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {profile.inventory?.map((it:any)=> (
                <div key={it.id} className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm">{it.item.name}</div>
                  <div className="text-xs text-white/60">{it.item.slot}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
