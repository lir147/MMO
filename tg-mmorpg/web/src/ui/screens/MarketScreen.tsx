
import React, { useEffect, useState } from 'react'
import { api, fmt } from '../../lib/api'
import { I } from '../components/Icon'
import clsx from 'clsx'

type Listing = { id:number; item_id:number; price:number; status:string; seller_id:number; type:string; endsAt?:string; minIncrement?:number; highestBid?:number }

export default function MarketScreen({ me }:{ me:any }){
  const [fixed,setFixed]=useState<Listing[]>([])
  const [aucs,setAucs]=useState<Listing[]>([])
  const [tab,setTab]=useState<'fixed'|'auction'>('fixed')
  const [busy,setBusy]=useState(false); const [err,setErr]=useState<string|null>(null)

  const load=()=> Promise.all([
    api<Listing[]>('/market/listings').then(setFixed),
    api<Listing[]>('/market/auctions').then(setAucs)
  ]).catch(e=>setErr(String(e)))
  useEffect(()=>{ load() },[])

  const buy = async (listingId:number)=>{ try{ setBusy(true); setErr(null); await api('/market/buy',{ listingId }); await load(); } catch(e:any){ setErr(e.message) } finally{ setBusy(false) } }
  const bid = async (listingId:number)=>{
    const amt = Number(prompt('Ставка (gold):', '100')||'0'); if(!amt) return;
    try{ setBusy(true); setErr(null); await api('/market/auction/bid',{ listingId, amount: amt }); await load(); } catch(e:any){ setErr(e.message) } finally{ setBusy(false) }
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><I.Store/> Маркет</h2>
        <div className="ml-auto flex rounded-xl overflow-hidden border border-white/10">
          <button className={clsx('px-3 py-1', tab==='fixed' && 'bg-white/10')} onClick={()=>setTab('fixed')}>Лоты</button>
          <button className={clsx('px-3 py-1', tab==='auction' && 'bg-white/10')} onClick={()=>setTab('auction')}>Аукционы</button>
        </div>
      </div>

      {tab==='fixed' && (
        <div className="space-y-2">
          {fixed.map((x)=> (
            <div key={x.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="text-sm">Лот #{x.id} · Item #{x.item_id}</div>
              <div className="flex items-center gap-3">
                <div className="stat flex items-center gap-1"><I.Coins size={16}/> {fmt(x.price)}</div>
                <button className="btn btn-primary" disabled={busy} onClick={()=>buy(x.id)}><I.ShoppingCart/> Купить</button>
              </div>
            </div>
          ))}
          {!fixed.length && <div className="text-white/50">Пока нет активных лотов</div>}
        </div>
      )}

      {tab==='auction' && (
        <div className="space-y-2">
          {aucs.map((x)=> {
            const ends = x.endsAt? new Date(x.endsAt) : null
            const left = ends ? Math.max(0, ends.getTime()-Date.now()) : 0
            const mm = Math.floor(left/60000), ss = Math.floor((left%60000)/1000)
            return (
              <div key={x.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2">
                <div className="text-sm">Аукцион #{x.id} · Item #{x.item_id}</div>
                <div className="text-xs text-white/60 flex items-center gap-2"><I.Clock4 size={14}/> {ends? `${mm}м ${ss}с`:'—'}</div>
                <div className="stat">Текущая: {fmt(x.highestBid ?? x.price)}</div>
                <button className="btn btn-primary" disabled={busy} onClick={()=>bid(x.id)}><I.Hammer/> Ставка</button>
              </div>
            )
          })}
          {!aucs.length && <div className="text-white/50">Пока нет аукционов</div>}
        </div>
      )}

      {err && <div className="mt-3 text-danger">{err}</div>}
    </section>
  )
}
