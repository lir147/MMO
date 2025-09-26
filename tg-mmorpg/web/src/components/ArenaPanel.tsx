
import React, { useEffect, useState } from 'react';
import { api } from '@/hooks/useApi';

type Row = { t: string; dmg?: number; action?: string };

export default function ArenaPanel() {
  const [log, setLog] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>('');

  const start = async () => {
    setBusy(true);
    setResult('');
    try {
      const res = await api<{ win: boolean; reward: number; log: Row[] }>('arena/queue', { method: 'POST' });
      setLog(res.log || []);
      setResult(res.win ? `Победа! +${res.reward} зол.` : `Поражение. +${res.reward} зол.`);
    } catch (e:any) {
      setResult(e.message || 'Ошибка арены');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <button onClick={start} disabled={busy} className="px-3 py-1 rounded bg-fuchsia-700 hover:bg-fuchsia-600 disabled:opacity-50">
          В бой
        </button>
        {result && <div className="text-sm opacity-80">{result}</div>}
      </div>
      <div className="mt-2 text-sm max-h-56 overflow-auto border border-slate-800 bg-slate-950/40 rounded p-2">
        {(log||[]).map((l,i)=> <div key={i} className="font-mono opacity-90">{l.t==='you' ? `Вы: ${l.dmg??l.action}` : l.t==='enemy'?`Враг: ${l.dmg??l.action}`: JSON.stringify(l)}</div>)}
      </div>
    </div>
  );
}
