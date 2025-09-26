
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/hooks/useApi';
import type { BattleState } from '@/types/battle';
import EffectsBar from '@/components/EffectsBar';

type Zone = { id: string; name: string; minLevel: number };

type SkillRow = { code: string; name: string; learnedLevel?: number; description?: string; element?: 'physical'|'fire'|'poison'|'ice'; cost?: { energy?: number; mp?: number } };

export default function FightPanel() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneId, setZoneId] = useState<string>('');
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [state, setState] = useState<BattleState | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const z = await api<Zone[]>('/fight/zones');
        setZones(z);
        const list = await api<any[]>('/skills/list');
        setSkills(list.map(s => ({ code: s.code, name: s.name, learnedLevel: s.learnedLevel, description: s.description })));
      } catch (e:any) {
        setErr(e.message || 'Ошибка загрузки');
      }
    })();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state?.log?.length]);

  const learned = useMemo(() => skills.filter(s => (s.learnedLevel ?? 0) > 0), [skills]);
  const start = async () => {
    setErr(''); setBusy(true);
    try {
      const res = await api<{ state: BattleState }>('/fight/start', { method: 'POST', body: zoneId ? { zoneId } : {} });
      setState(res.state);
    } catch (e:any) {
      setErr(e.message || 'Ошибка старта');
    } finally {
      setBusy(false);
    }
  };

  const turn = async (action: string) => {
    if (!state || state.turn !== 'player') return;
    setBusy(true); setErr('');
    try {
      const res = await api<{ state: BattleState } | { state: BattleState; rewards?: any; defeat?: boolean }>('/fight/turn', {
        method: 'POST', body: { action }
      });
      setState((res as any).state);
      if ((res as any).rewards) {
        const rw = (res as any).rewards;
        const loot = rw.loot?.length ? `Лут: ${rw.loot.join(', ')}` : '';
        setErr(`Победа! +${rw.xp} XP, +${rw.gold} зол. ${loot}`);
      } else if ((res as any).defeat) {
        setErr('Поражение…');
      }
    } catch (e:any) {
      setErr(e.message || 'Ошибка хода');
    } finally {
      setBusy(false);
    }
  };

  const resetChar = async (mode: 'full'|'respec') => {
    if (!confirm(mode === 'full' ? 'Полный сброс персонажа?' : 'Сброс без потери уровня/опыта?')) return;
    try {
      await api('/character/reset', { method: 'POST', body: { mode } });
      alert('Готово. Перезагрузите страницу, чтобы снова выбрать класс/ник.');
    } catch (e:any) {
      alert(e.message || 'Ошибка сброса');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3 shadow-lg">
      <div className="h-1 w-full bg-slate-800 rounded overflow-hidden mb-2">
        <div key={(state?.turn||"none")} className={`h-full ${state?.turn==="player"?"bg-emerald-500":"bg-rose-500"}`} style={{width:"100%", transition:"width 900ms"}} />
      </div>
      <div className="text-xs opacity-70">Ход: {state?.turn || '—'}</div>
      <div className="flex flex-wrap items-center gap-2">
        <select value={zoneId} onChange={e=>setZoneId(e.target.value)} className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
          <option value="">Автовыбор зоны</option>
          {zones.map(z => (<option key={z.id} value={z.id}>{z.name}</option>))}
        </select>
        <button onClick={start} disabled={busy} className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50">Начать бой</button>
        
      {zoneId && zones.length>0 && (
        <div className="mt-2 rounded-xl border border-slate-700 bg-slate-950/40 p-2 text-xs">
          <div className="font-semibold mb-1">Информация о зоне</div>
          {(() => { const z = zones.find(z=>z.id===zoneId); if (!z) return null; return (
            <div className="grid gap-1">
              {(z as any).monsters?.map((m:any, i:number)=> (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <span className="opacity-80">{m.name}</span>
                  {m.resists && <span className="opacity-60">резисты: {Object.keys(m.resists).map(k=>`${k}:${Math.round((m.resists[k]||0)*100)}%`).join(' ')}</span>}
                  {m.drops?.length>0 && <span className="opacity-60">дроп: {m.drops.map((d:any)=>d.code).join(', ')}</span>}
                </div>
              ))}
            </div>
          )})()}
        </div>
      )}

        <div className="ml-auto flex gap-2">
          <button onClick={()=>resetChar('respec')} className="px-2 py-1 text-xs rounded bg-indigo-700 hover:bg-indigo-600">Сброс (respec)</button>
          <button onClick={()=>resetChar('full')} className="px-2 py-1 text-xs rounded bg-rose-700 hover:bg-rose-600">Сброс (full)</button>
        </div>
      </div>

      {err && <div className="mt-2 text-sm text-amber-300">{err}</div>}

      {state && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-700 p-3">
            <div className="text-sm opacity-70">Вы</div>
            <div className="text-lg font-semibold">{state.player.hp} / {state.player.maxHp} HP</div>
            <div className="h-2 w-full bg-slate-800 rounded overflow-hidden my-1">
              <div className="h-full bg-emerald-500" style={{width: `${Math.max(0, Math.min(100, Math.round(100*state.player.hp/state.player.maxHp))) }%`}} />
            </div>
            <div className="text-xs opacity-70">ATK {state.player.atk} • CRIT {Math.round((state.player.crit ?? 0)*100)}% • DODGE {Math.round((state.player.dodge ?? 0)*100)}%</div>
            {typeof state.player.maxMp==="number" && <div className="text-xs mt-1">MP {state.player.mp} / {state.player.maxMp}</div>}
            {typeof state.playerEnergy==="number" && <div className="text-xs">Energy {state.playerEnergy}</div>}
            <EffectsBar effects={state.player.effects} />
          </div>
          <div className="rounded-xl border border-slate-700 p-3">
            <div className="text-sm opacity-70">Враг</div>
            <div className="text-lg font-semibold">{(state.enemy as any).name || '???'}</div>
            <div className="text-lg font-semibold">{state.enemy.hp} / {state.enemy.maxHp} HP</div>
            <div className="h-2 w-full bg-slate-800 rounded overflow-hidden my-1">
              <div className="h-full bg-rose-500" style={{width: `${Math.max(0, Math.min(100, Math.round(100*state.enemy.hp/state.enemy.maxHp))) }%`}} />
            </div>
            <div className="text-xs opacity-70">ATK {state.enemy.atk}</div>
            <EffectsBar effects={state.enemy.effects} />
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>turn('basic')} disabled={busy || state.turn!=='player' || ((state as any)?.cooldowns?.[s.code]??0)>0 || (s.cost?.energy ?? 0) > (state.playerEnergy ?? 0) || (s.cost?.mp ?? 0) > (state.player.mp ?? Infinity)} className="px-3 py-1 rounded bg-sky-700 hover:bg-sky-600 disabled:opacity-50">Базовая атака</button>
              {learned.map(s => (
                <button key={s.code} onClick={()=>turn(s.code)} disabled={busy || state.turn!=='player' || ((state as any)?.cooldowns?.[s.code]??0)>0 || (s.cost?.energy ?? 0) > (state.playerEnergy ?? 0) || (s.cost?.mp ?? 0) > (state.player.mp ?? Infinity)} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-50" title={`${s.description || s.code}${s.element?`\nТип: ${s.element}`:''}${s.cost?(s.cost.energy?`\nЭнергия: ${s.cost.energy}`:'')+(s.cost.mp?`\nМана: ${s.cost.mp}`:''):''}`}>
                  {s.name} {s.learnedLevel && s.learnedLevel>1 ? `+${s.learnedLevel-1}` : ''}{(state as any)?.cooldowns?.[s.code]>0 ? ` (${(state as any).cooldowns?.[s.code]})` : ''}
                </button>
              ))}
            </div>
            <div ref={logRef} className="mt-3 max-h-56 overflow-auto rounded border border-slate-800 bg-slate-950/50 p-2 text-sm leading-6">
              {(state.log || []).map((l, i) => (
                <div key={i} className="font-mono opacity-90">
                  {typeof l === 'string'
                    ? l
                    : (l.t==='start' ? `Начало боя: зона ${l.zone}, враг: ${l.enemy}`
                    : l.t==='you' ? `Вы -> ${l.action}${l.dmg?`: ${l.dmg}`:''}`
                    : l.t==='enemy' ? `Враг -> ${l.action}${l.dmg?`: ${l.dmg}`:''}`
                    : JSON.stringify(l)
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
