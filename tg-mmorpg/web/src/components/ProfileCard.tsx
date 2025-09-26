
import React, { useEffect, useState } from 'react';
import { api } from '@/hooks/useApi';

export default function ProfileCard({ id }:{ id?: number }) {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(()=>{
    (async ()=> {
      try { setD(await api(`/profile/${id||'me'}`)); } catch (e:any) { setErr(e.message||'Ошибка'); }
    })();
  },[id]);
  if (err) return <div className="text-sm text-amber-300">{err}</div>;
  if (!d) return <div className="text-sm opacity-70">Загрузка…</div>;
  const ch = d.character || d;
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 shadow-lg">
      <div className="text-lg font-semibold mb-1">{ch.name || 'Безымянный'}</div>
      <div className="text-sm opacity-80">Класс: {ch.class} • Lvl {ch.level}</div>
      <div className="mt-2 text-sm grid grid-cols-2 gap-2">
        <div>STR {ch.str}</div><div>AGI {ch.agi}</div>
        <div>INT {ch.int}</div><div>VIT {ch.vit}</div>
        <div>DEX {(ch as any).dex}</div><div>LUCK {(ch as any).luck}</div>
      </div>
    </div>
  );
}
