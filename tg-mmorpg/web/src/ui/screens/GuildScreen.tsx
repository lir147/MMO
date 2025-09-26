
import React, { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { I } from '../components/Icon'

export default function GuildScreen({ me, onChanged }:{ me:any; onChanged: ()=>void }){
  const [busy,setBusy]=useState(false); const [err,setErr]=useState<string|null>(null)
  const [create,setCreate]=useState({ name:'', tag:'' }); const [joinId,setJoinId]=useState('')
  const [q,setQ]=useState(''); const [list,setList]=useState<any[]>([])

  const load = ()=> api<any[]>('/guild/list?q='+encodeURIComponent(q)).then(setList).catch(e=>setErr(String(e)))
  useEffect(()=>{ load() },[q])

  const act = async (fn:()=>Promise<any>)=>{ try{ setBusy(true); setErr(null); await fn(); onChanged(); } catch(e:any){ setErr(e.message) } finally{ setBusy(false) } }

  return (
    <section className="card p-4">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><I.Users2/> Гильдия</h2>
      {me.guild ? (
        <div className="space-y-3">
          <div className="text-white/80">{me.guild.name} <span className="text-white/50">[{me.guild.tag}]</span></div>
          <div className="text-white/60 text-sm">Участников: {me.guild.members}</div>
          <button className="btn" disabled={busy} onClick={()=>act(()=>api('/guild/leave'))}>Покинуть гильдию</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="font-medium text-white/80 mb-2">Создать</div>
            <input className="w-full mb-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none" placeholder="Название" value={create.name} onChange={e=>setCreate(s=>({...s,name:e.target.value}))}/>
            <input className="w-full mb-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none" placeholder="Тег (уникальный)" value={create.tag} onChange={e=>setCreate(s=>({...s,tag:e.target.value}))}/>
            <button className="btn btn-primary w-full" disabled={busy || !create.name || !create.tag} onClick={()=>act(()=>api('/guild/create',{ name:create.name, tag:create.tag }))}>Создать</button>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="font-medium text-white/80 mb-2">Лист гильдий</div>
            <input className="w-full mb-2 px-3 py-2 rounded-lg bg-black/30 border border-white/10 outline-none" placeholder="Поиск по имени/тегу" value={q} onChange={e=>setQ(e.target.value)}/>
            <div className="space-y-2 max-h-64 overflow-auto">
              {list.map(g => (
                <div key={g.id} className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>{g.name} <span className="text-white/50">[{g.tag}]</span></div>
                  <div className="text-white/50 text-sm">{g.members}</div>
                  <button className="btn" disabled={busy} onClick={()=>act(()=>api('/guild/join',{ guildId: g.id }))}>Вступить</button>
                </div>
              ))}
              {!list.length && <div className="text-white/50">Ничего не найдено</div>}
            </div>
          </div>
        </div>
      )}
      {err && <div className="mt-3 text-danger">{err}</div>}
    </section>
  )
}
