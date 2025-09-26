
import React, { useEffect, useMemo, useState } from 'react'
import { api, needExpFor, fmt } from '../lib/api'
import { Bar } from './components/Bar'
import { I } from './components/Icon'
import clsx from 'clsx'
import Modal from './components/Modal'
import GuildScreen from './screens/GuildScreen'
import MarketScreen from './screens/MarketScreen'
import ArenaScreen from './screens/ArenaScreen'
import BossScreen from './screens/BossScreen'
import QuestsScreen from './screens/QuestsScreen'
import LeaderboardScreen from './screens/LeaderboardScreen'

type Me = {
  user: { referralCode: string }
  character: { id: number; class: string; level: number; exp: string|number; gold: string|number; shards: string|number; energy: number; rating: number; location: string }
  inventory: { id: number; equipped: boolean; item: { name: string; rarity: string; code: string; stats?: any; set?: { code:string; name:string; bonuses:string } } }[]
  quests: any[]
  guild: null | { name: string; tag: string; members: number }
  locations: string[]
}

type Tab = 'home'|'guild'|'market'|'arena'|'boss'|'top'

export default function App(){
  const [me,setMe]=useState<Me|null>(null)
  const [busy,setBusy]=useState(false)
  const [err,setErr]=useState<string|null>(null)
  const [toast,setToast]=useState<string|null>(null)
  const [tab,setTab]=useState<Tab>('home')
  const [modal,setModal]=useState<{open:boolean; item?: any}>({open:false})

  const load = ()=> api<Me>('/me').then(setMe).catch(e=>setErr(String(e)))
  useEffect(()=>{ load() },[])

  const expNum = useMemo(()=> Number(me?.character.exp ?? 0), [me])
  const expMax = useMemo(()=> needExpFor(me?.character.level ?? 1), [me])
  const gold = useMemo(()=> fmt(me?.character.gold ?? 0), [me])
  const shards = useMemo(()=> fmt(me?.character.shards ?? 0), [me])

  const act = async (fn: ()=>Promise<any>, okMsg?: string)=>{ try{ setBusy(true); setErr(null); await fn(); await load(); if (okMsg) setToast(okMsg) } catch(e:any){ setErr(e.message) } finally{ setBusy(false); setTimeout(()=>setToast(null), 2000) } }

  const ItemModal = () => (
    <Modal open={modal.open} onClose={()=>setModal({open:false})} title={modal.item?.item?.name ?? 'Предмет'}>
      {modal.item && (
        <div className="space-y-2">
          <div className={clsx('text-sm', `rarity-${modal.item.item.rarity}`)}>Редкость: {modal.item.item.rarity}</div>
          <div className="text-sm">Слот: {modal.item.item.slot || '—'}</div>
          {modal.item.item.set && <div className="text-sm">Сет: {modal.item.item.set.name} [{modal.item.item.set.code}]</div>}
          {modal.item.item.stats && <pre className="text-xs bg-black/30 p-2 rounded-lg overflow-auto">{JSON.stringify(modal.item.item.stats, null, 2)}</pre>}
          {modal.item.equipped ? (
            <button className="btn w-full" disabled={busy} onClick={()=>act(()=>api('/unequip',{ inventoryId: modal.item.id }),'Снято')}>Снять</button>
          ) : modal.item.item.slot ? (
            <button className="btn btn-primary w-full" disabled={busy} onClick={()=>act(()=>api('/equip',{ inventoryId: modal.item.id }),'Надето')}>Надеть</button>
          ) : null}
          {!modal.item.equipped && (
            <div className="grid grid-cols-2 gap-2">
              <button className="btn w-full" disabled={busy} onClick={()=>{ const price=prompt('Фикс-цена (gold):','50'); if(!price) return; act(()=>api('/market/list',{ itemId: modal.item.id, price: Number(price) }), 'Лот выставлен'); }}>Лот (фикс)</button>
              <button className="btn w-full" disabled={busy} onClick={()=>{ const sp=prompt('Стартовая цена:','50'); const inc=prompt('Мин. шаг:','5'); const mins=prompt('Минут до конца:','10'); if(!sp||!inc||!mins) return; act(()=>api('/market/auction/list',{ itemId: modal.item.id, startingPrice:Number(sp), minIncrement:Number(inc), endsInMin:Number(mins) }), 'Аукцион создан'); }}>Аукцион</button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )

  if(!me) return <div className="h-full grid place-items-center text-white/80">Загрузка…</div>

  return (
    <div className="min-h-full text-white pb-16">
      <header className="sticky top-0 z-10 bg-gradient-to-b from-bg to-bg/60 backdrop-blur border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap hud">
          <div className="text-xl font-extrabold tracking-wide">Shards</div>
          <div className="stat">Класс: <b className="text-white/90">{me.character.class}</b></div>
          <div className="stat">Ур. <b className="text-white/90">{me.character.level}</b></div>
          <div className="xp flex-1 min-w-[200px]"><Bar value={expNum} max={expMax} color="shard" /><div className="text-[11px] mt-1 text-white/50">Опыт {expNum}/{expMax}</div></div>
          <div className="stat flex items-center gap-1"><I.Coins size={16}/> <b className="text-gold">{gold}</b></div>
          <div className="stat flex items-center gap-1"><I.Gem size={16}/> <b className="text-shard">{shards}</b></div>
          <div className="stat flex items-center gap-1"><I.Trophy size={16}/> {me.character.rating}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {tab === 'home' && (
          <section className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 card p-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge"><I.MapPinned size={14}/> {me.character.location}</span>
                <span className="badge"><I.FlameKindling size={14}/> Энергия {me.character.energy}</span>
                {me.guild ? <span className="badge"><I.Users2 size={14}/> {me.guild.name} [{me.guild.tag}] · {me.guild.members}</span> : <span className="badge">Без гильдии</span>}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <button className="btn btn-primary" disabled={busy} onClick={()=>act(()=>api('/fight/start',{enemy:'slime'}),'Бой завершён')}><I.Swords/> Сразиться</button>
                <button className="btn" disabled={busy} onClick={()=>act(()=>api('/arena/queue'),'Бой на арене')}><I.Trophy/> Арена</button>
                <button className="btn" disabled={busy} onClick={()=>act(()=>api('/daily/claim'),'Ежедневная награда!')}><I.Castle/> Daily</button>
                <button className="btn" disabled={busy} onClick={()=>act(()=>api('/craft/mine'),'Добыча руды')}><I.Pickaxe/> Майнинг</button>
                <button className="btn" disabled={busy} onClick={()=>act(()=>api('/craft/craft',{recipe:'iron_sword'}),'Скрафтил меч')}><I.Anvil/> Крафт</button>
              </div>
              <div className="mt-6"><QuestsScreen me={me} busy={busy} act={act}/></div>
            </div>
            <aside className="card p-4">
              <h3 className="text-sm uppercase tracking-wide text-white/60 mb-2">Инвентарь</h3>
              <div className="grid grid-cols-2 gap-2">
                {me.inventory?.map(it => (
                  <div key={it.id} className="p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer" onClick={()=>setModal({open:true, item: it})}>
                    <div className={clsx('text-sm font-medium', `rarity-${it.item.rarity}`)}>{it.item.name}</div>
                    <div className="text-xs text-white/60">{it.item.code}</div>
                    {it.item.set && <div className="text-[10px] text-white/50 mt-1">Сет: {it.item.set.name}</div>}
                    {it.equipped && <div className="mt-1 text-[10px] text-accent">надето</div>}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="text-sm uppercase tracking-wide text-white/60 mb-2">Реферал</h3>
                <div className="text-xs text-white/70 break-all">Код: <b>{me.user.referralCode}</b></div>
              </div>
            </aside>
          </section>
        )}
        {tab === 'guild'  && <GuildScreen me={me} onChanged={()=>load()} />}
        {tab === 'market' && <MarketScreen me={me} />}
        {tab === 'arena'  && <ArenaScreen me={me} />}
        {tab === 'boss'   && <BossScreen />}
        {tab === 'top'    && <LeaderboardScreen />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-panel/95 backdrop-blur border-t border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-5">
          <Tab icon={<I.Castle size={18}/>} label="Дом"    active={tab==='home'}   onClick={()=>setTab('home')} />
          <Tab icon={<I.Users2 size={18}/>} label="Гильдия" active={tab==='guild'}  onClick={()=>setTab('guild')} />
          <Tab icon={<I.Store size={18}/>}  label="Маркет" active={tab==='market'} onClick={()=>setTab('market')} />
          <Tab icon={<I.Trophy size={18}/>} label="Арена"  active={tab==='arena'}  onClick={()=>setTab('arena')} />
          <Tab icon={<I.ListOrdered size={18}/>}  label="Рейтинг"   active={tab==='top'}   onClick={()=>setTab('top')} />
        </div>
      </nav>

      <ItemModal/>
      {toast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-panel border border-white/10 shadow-soft">{toast}</div>}
      {err && <div className="fixed bottom-20 right-4 px-4 py-2 rounded-xl bg-danger/20 border border-danger/30 shadow-soft">{String(err)}</div>}
    </div>
  )
}
function Tab({ icon, label, active, onClick }:{ icon: React.ReactNode; label: string; active: boolean; onClick: ()=>void }){
  return <button onClick={onClick} className={clsx('py-3 text-sm flex items-center justify-center gap-2', active ? 'text-accent border-t-2 border-accent' : 'text-white/70')}>{icon}<span>{label}</span></button>
}
