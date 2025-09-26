
import React, { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { I } from '../components/Icon'
type Fight = { time:number; win:boolean; delta:number; rating:number; opponent:number }
export default function ArenaScreen({ me }:{ me:any }){
  const [hist,setHist]=useState<Fight[]>(()=>{ try{ return JSON.parse(localStorage.getItem('arenaHist')||'[]') }catch{ return [] } })
  const [busy,setBusy]=useState(false); const [err,setErr]=useState<string|null>(null)
  const fight = async ()=>{ try{ setBusy(true); setErr(null); const r:any = await api('/arena/queue'); const f:Fight={ time:Date.now(), win:r.win, delta:r.ratingChange, rating:r.rating, opponent:r.opponent?.rating??0 }; const next=[f,...hist].slice(0,20); setHist(next); localStorage.setItem('arenaHist',JSON.stringify(next)); }catch(e:any){ setErr(e.message) } finally{ setBusy(false) } }
  return (
    <section className="card p-4">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><I.Trophy/> Арена</h2>
      <div className="flex items-center gap-2 mb-3">
        <button className="btn btn-primary" disabled={busy} onClick={fight}><I.Trophy/> В бой</button>
        <button className="btn" onClick={()=>{ setHist([]); localStorage.removeItem('arenaHist'); }}>Сбросить историю</button>
      </div>
      <div className="space-y-2">
        {hist.map((h,i)=> (<div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"><div className="text-sm">{new Date(h.time).toLocaleTimeString()} · противник {h.opponent}</div><div className={h.win? 'text-success':'text-danger'}>{h.win? 'Победа':'Поражение'} ({h.delta>0?'+':''}{h.delta}) · {h.rating}</div></div>))}
        {!hist.length && <div className="text-white/50">Ещё не сражались на арене</div>}
      </div>
      {err && <div className="mt-3 text-danger">{err}</div>}
    </section>
  )
}
