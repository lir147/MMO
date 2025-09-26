
import React, { useEffect, useState } from 'react';
import { api } from '@/hooks/useApi';

type Lot = { id: string; itemCode: string; minBid: number; topBid: number; timeLeftSec: number };

export default function AuctionPanel() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{ itemCode: string; minBid: number; durationMin: number }>({ itemCode: 'iron_sword', minBid: 50, durationMin: 30 });
  const [bid, setBid] = useState<{ id: string; amount: number }>({ id: '', amount: 0 });

  const load = async () => {
    try {
      const data = await api<Lot[]>('/auction/listings');
      setLots(data);
    } catch (e:any) {
      setErr(e.message || 'Ошибка загрузки');
    }
  };

  useEffect(()=>{ load(); const t = setInterval(load, 3000); return ()=> clearInterval(t); }, []);

  const create = async () => {
    setBusy(true);
    try {
      await api('/auction/list', { method:'POST', body: form });
      await load();
    } catch (e:any) { alert(e.message); } finally { setBusy(false); }
  };

  const placeBid = async () => {
    setBusy(true);
    try {
      await api('/auction/bid', { method:'POST', body: { auctionId: bid.id, amount: bid.amount } });
      await load();
    } catch (e:any) { alert(e.message); } finally { setBusy(false); }
  };

  const claim = async (id: string) => {
    setBusy(true);
    try {
      await api('/auction/claim', { method:'POST', body: { auctionId: id } });
      await load();
    } catch (e:any) { alert(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 shadow-lg">
      <div className="text-lg font-semibold mb-2">Аукцион (демо)</div>
      <div className="flex flex-wrap items-end gap-2 text-sm">
        <input className="px-2 py-1 rounded bg-slate-800 border border-slate-700" placeholder="itemCode" value={form.itemCode} onChange={e=>setForm({...form, itemCode:e.target.value})} />
        <input className="px-2 py-1 rounded bg-slate-800 border border-slate-700" placeholder="minBid" type="number" value={form.minBid} onChange={e=>setForm({...form, minBid:Number(e.target.value)})} />
        <input className="px-2 py-1 rounded bg-slate-800 border border-slate-700" placeholder="duration (min)" type="number" value={form.durationMin} onChange={e=>setForm({...form, durationMin:Number(e.target.value)})} />
        <button onClick={create} disabled={busy} className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50">Выставить</button>
      </div>
      <div className="mt-3 text-sm">
        {(lots||[]).map(l => (
          <div key={l.id} className="flex items-center gap-2 border-t border-slate-800 py-2">
            <div className="w-40">{l.itemCode}</div>
            <div className="w-24">Мин: {l.minBid}</div>
            <div className="w-24">Топ: {l.topBid}</div>
            <div className="w-24">{l.timeLeftSec}s</div>
            <button onClick={()=>claim(l.id)} className="px-2 py-1 rounded bg-indigo-700 hover:bg-indigo-600">Забрать</button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-end gap-2 text-sm">
        <input className="px-2 py-1 rounded bg-slate-800 border border-slate-700" placeholder="auctionId" value={bid.id} onChange={e=>setBid({...bid, id:e.target.value})} />
        <input className="px-2 py-1 rounded bg-slate-800 border border-slate-700" placeholder="amount" type="number" value={bid.amount} onChange={e=>setBid({...bid, amount:Number(e.target.value)})} />
        <button onClick={placeBid} disabled={busy} className="px-3 py-1 rounded bg-sky-700 hover:bg-sky-600 disabled:opacity-50">Сделать ставку</button>
      </div>
      {err && <div className="mt-2 text-amber-300">{err}</div>}
    </div>
  );
}
