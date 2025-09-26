import { useEffect, useState } from 'react';

export default function RaidBoss(){
  const [st,setSt] = useState<any>(null);
  const [busy,setBusy] = useState(false);

  async function load(){ const r = await fetch('/api/worldboss/status').then(x=>x.json()); setSt(r); }
  useEffect(()=>{ load(); },[]);

  async function hit(action='basic'){
    setBusy(true);
    const r = await fetch('/api/worldboss/attack',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action }) }).then(x=>x.json());
    setBusy(false);
    setSt({ boss: r.boss, hp: r.hp, maxHp: r.maxHp, nextSpawnAt: r.nextSpawnAt, alive: r.hp>0 });
  }

  if (!st) return <div className="p-4">...</div>;
  return (
    <div className="p-4 space-y-3 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">🐲 Рейд-босс</h1>
      {st.alive ? (
        <div className="border rounded p-3 bg-gray-50">
          <div>HP: {st.hp}/{st.maxHp}</div>
          <div className="flex gap-2 mt-2">
            <button disabled={busy} onClick={()=>hit('basic')} className="px-3 py-1 rounded bg-gray-800 text-white">Бить</button>
            <button disabled={busy} onClick={()=>hit('fireball')} className="px-3 py-1 rounded bg-orange-600 text-white">Огненный шар</button>
          </div>
        </div>
      ) : (
        <div className="border rounded p-3 bg-yellow-50">Возродится: {new Date(st.nextSpawnAt).toLocaleTimeString()}</div>
      )}
    </div>
  );
}
