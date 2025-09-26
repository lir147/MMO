import { useEffect, useState } from 'react';

type Zone = { id:string; name:string; minLevel:number; };
type Battle = { turn:string; player:{hp:number;maxHp:number}; enemy:{name:string;hp:number;maxHp:number}; log:any[]; cooldowns?:Record<string,number> };

export default function Fight() {
  const [zones,setZones] = useState<Zone[]>([]);
  const [cur,setCur] = useState<string>('');
  const [state,setState] = useState<Battle|null>(null);
  const [busy,setBusy] = useState(false);

  useEffect(()=>{ fetch('/api/zones').then(r=>r.json()).then(setZones); },[]);

  async function start() {
    setBusy(true);
    const res = await fetch('/api/dungeon/start',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ zoneId: cur || undefined }) }).then(r=>r.json());
    setState(res.state);
    setBusy(false);
  }
  async function turn(action:string) {
    if (!state) return;
    setBusy(true);
    const res = await fetch('/api/dungeon/turn',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action }) }).then(r=>r.json());
    setState(res.state);
    setBusy(false);
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">⚔️ Сражение</h1>
      <div className="flex gap-2 items-center">
        <select className="border px-2 py-1 rounded" value={cur} onChange={e=>setCur(e.target.value)}>
          <option value="">Автовыбор</option>
          {zones.map(z=> <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        <button disabled={busy} onClick={start} className="px-3 py-1 rounded bg-indigo-600 text-white">Начать бой</button>
      </div>

      {state && (
        <div className="border rounded p-3 space-y-3 bg-gray-50">
          <div className="flex justify-between">
            <div>Вы: {state.player.hp}/{state.player.maxHp}</div>
            <div>{state.enemy.name}: {state.enemy.hp}/{state.enemy.maxHp}</div>
          </div>
          <div className="flex gap-2">
            <button disabled={busy || state.turn!=='player'} onClick={()=>turn('basic')} className="px-3 py-1 bg-gray-800 text-white rounded">Обычная атака</button>
            <button disabled={busy || state.turn!=='player'} onClick={()=>turn('slash')} className="px-3 py-1 bg-rose-600 text-white rounded">Навык: Удар</button>
            <button disabled={busy || state.turn!=='player'} onClick={()=>turn('fireball')} className="px-3 py-1 bg-orange-600 text-white rounded">Навык: Огонь</button>
          </div>
          <div className="h-40 overflow-auto text-sm bg-white border rounded p-2">
            {state.log.map((l,i)=><div key={i}>{JSON.stringify(l)}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
