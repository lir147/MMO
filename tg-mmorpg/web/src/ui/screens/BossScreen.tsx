
import React, { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { I } from '../components/Icon'
export default function BossScreen(){
  const [st,setSt]=useState<any>(null); const [busy,setBusy]=useState(false); const [msg,setMsg]=useState<string|null>(null); const [err,setErr]=useState<string|null>(null)
  const load=()=> api('/worldboss/status').then(setSt).catch(e=>setErr(String(e)))
  useEffect(()=>{ load() },[])
  const fight= async()=>{ try{ setBusy(true); setErr(null); const r:any = await api('/worldboss/fight'); setMsg(r.win? 'Победа! Получены шард(ы)':'Проиграл…'); await load(); setTimeout(()=>setMsg(null),2000) } catch(e:any){ setErr(e.message) } finally{ setBusy(false) } }
  if(!st) return <section className="card p-4">Загрузка…</section>
  return (
    <section className="card p-4">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><I.Crown/> Мировой босс</h2>
      <div className="text-white/80">Статус: {st.open? 'Окно открыто' : 'Закрыто'}</div>
      <div className="text-white/60 text-sm mb-3">Окно заканчивается / следующее: {new Date(st.windowEndsAt).toLocaleString()}</div>
      <button className="btn btn-primary" disabled={!st.open || busy} onClick={fight}>Сразиться</button>
      {msg && <div className="mt-3 text-success">{msg}</div>}
      {err && <div className="mt-3 text-danger">{err}</div>}
    </section>
  )
}
