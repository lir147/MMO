
import React, { useEffect, useState } from 'react';
import { api } from '@/hooks/useApi';

export default function WorldBossPanel() {
  const [st, setSt] = useState<any>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try { setSt(await api('/worldboss/status')); } catch (e:any) { setErr(e.message||'Ошибка'); }
  };
  useEffect(()=>{ load(); const t = setInterval(load, 4000); return ()=> clearInterval(t); }, []);
  const attack = async (action='basic') => {
    setBusy(true);
    try {
      const r = await api('/worldboss/attack', { method:'POST', body:{ action } });
      setSt(r);
    } catch (e:any) { alert(e.message); } finally { setBusy(false); }
  };
  const pct = st && st.maxHp ? Math.max(0, Math.min(100, Math.round(100*st.hp/st.maxHp))) : 0;
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 shadow-lg">
      <div className="text-lg font-semibold mb-2">Мировой босс</div>
      {!st && <div className="text-sm opacity-70">Загрузка…</div>}
      {st && (
        <>
          <div className="text-sm opacity-80">{st.alive ? 'Активен' : 'Отсутствует'}</div>
          {st.alive ? (
            <>
              <div className="font-semibold mt-1">{st.boss}</div>
              <div className="h-2 bg-slate-800 rounded overflow-hidden my-1"><div className="h-full bg-rose-500" style={{width:`${pct}%`}}/></div>
              <div className="text-xs opacity-70">HP {st.hp} / {st.maxHp}</div>
              <div className="flex gap-2 mt-2">
                <button disabled={busy} onClick={()=>attack('basic')} className="px-3 py-1 rounded bg-rose-700 hover:bg-rose-600 disabled:opacity-50">Атаковать</button>
                <button disabled={busy} onClick={()=>attack('fireball')} className="px-3 py-1 rounded bg-orange-700 hover:bg-orange-600 disabled:opacity-50">Fireball</button>
                <button disabled={busy} onClick={()=>attack('poison')} className="px-3 py-1 rounded bg-lime-700 hover:bg-lime-600 disabled:opacity-50">Poison</button>
              </div>
            </>
          ) : (
            <div className="text-sm opacity-80 mt-1">Следующее появление: {st.nextSpawnAt ? new Date(st.nextSpawnAt).toLocaleString() : 'скоро'}</div>
          )}
        </>
      )}
      {err && <div className="mt-2 text-amber-300 text-sm">{err}</div>}
    </div>
  );
}
