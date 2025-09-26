
import React from 'react'
import { api } from '../../lib/api'
export default function QuestsScreen({ me, busy, act }:{ me:any; busy:boolean; act:(fn:()=>Promise<any>, okMsg?: string)=>void }){
  return (
    <div>
      <h3 className="text-sm uppercase tracking-wide text-white/60 mb-2">Контракты</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        <button className="btn" disabled={busy} onClick={()=>act(()=>api('/quest/contract/new'),'Контракт добавлен')}>Новый контракт</button>
      </div>
      <div className="space-y-2">
        {me.quests?.map((q:any) => {
          const p = Math.min(100, Math.round((q.progress/q.amount)*100));
          return (
            <div key={q.id} className="p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-white/90">{q.type}: <b>{q.target}</b></div>
                <div className="text-white/60 text-sm">{q.progress}/{q.amount} · [{q.status}]</div>
              </div>
              <div className="progress mt-2"><span style={{ width: p+'%' }} /></div>
              <div className="mt-2 flex gap-2">
                <button className="btn" disabled={busy} onClick={()=>act(()=>api('/quest/contract/progress',{questId:q.id,amount:1}), '+1 к прогрессу')}>+1</button>
                <button className="btn" disabled={busy || q.status!=='completed'} onClick={()=>act(()=>api('/quest/contract/claim',{questId:q.id}), 'Награда получена')}>Забрать</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
