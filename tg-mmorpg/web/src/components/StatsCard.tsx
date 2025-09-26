
import React, { useEffect, useState } from 'react';
import { api } from '@/hooks/useApi';

export default function StatsCard() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState<string>('');
  useEffect(()=>{
    api('/character/stats').then(setD).catch((e:any)=> setErr(e.message||'Ошибка'));
  },[]);
  if (err) return <div className="text-sm text-amber-300">{err}</div>;
  if (!d) return <div className="text-sm opacity-70">Загрузка…</div>;
  const Row = ({k}:{k:string}) => <div className="flex justify-between"><span className="opacity-70">{k.toUpperCase()}</span><span>{Number(d.base[k]||0)} → <b>{Number(d.totals[k]||0)}</b></span></div>;
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 shadow-lg">
      <div className="text-lg font-semibold mb-2">Характеристики</div>
      <div className="grid gap-1 text-sm">
        {['str','agi','int','vit','dex','luck','hp','atk'].map(k=> <Row key={k} k={k} />)}
      </div>
      {(Object.keys(d.setBonuses||{}).length>0) && (
        <div className="mt-2 text-xs opacity-80">Бонусы сетов: {Object.keys(d.setBonuses).map(k=> `${k}+${d.setBonuses[k]}`).join(', ')}</div>
      )}
    </div>
  );
}
