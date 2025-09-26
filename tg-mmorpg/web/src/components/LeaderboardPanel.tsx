
import React, { useEffect, useState } from 'react';
import { api } from '@/hooks/useApi';

type Row = { id:number; name:string; level:number; exp:number; gearScore:number };

export default function LeaderboardPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState('');
  useEffect(()=>{
    (async()=>{
      try {
        const data = await api<Row[]>('/leaderboard');
        setRows(data);
      } catch (e:any) { setErr(e.message||'Ошибка'); }
    })();
  },[]);
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 shadow-lg">
      <div className="text-lg font-semibold mb-2">Рейтинг</div>
      {err && <div className="text-sm text-amber-300">{err}</div>}
      <div className="text-sm">
        {rows.map((r,i)=>(
          <div key={r.id} className="flex items-center gap-3 border-t border-slate-800 py-1">
            <div className="w-6 text-slate-400">{i+1}</div>
            <div className="flex-1">{r.name}</div>
            <div className="w-20">Lvl {r.level}</div>
            <div className="w-24">GS {r.gearScore}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
