import { useEffect, useState } from 'react';

export default function Guild(){
  const [list,setList] = useState<any[]>([]);
  const [name,setName] = useState('');
  const [tag,setTag] = useState('');
  const [busy,setBusy]= useState(false);

  async function load(){ const r = await fetch('/api/guild/list').then(x=>x.json()); setList(r); }
  useEffect(()=>{ load(); },[]);

  async function create(){
    setBusy(true);
    const r = await fetch('/api/guild/create',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, tag }) }).then(x=>x.json());
    setBusy(false);
    if (r.ok) { setName(''); setTag(''); load(); }
    else alert(JSON.stringify(r));
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">🏰 Гильдии</h1>

      <div className="border rounded p-3 bg-gray-50">
        <div className="font-semibold mb-2">Создать</div>
        <div className="flex gap-2">
          <input className="border px-2 py-1 rounded flex-1" placeholder="Имя" value={name} onChange={e=>setName(e.target.value)} />
          <input className="border px-2 py-1 rounded w-32" placeholder="TAG" value={tag} onChange={e=>setTag(e.target.value)} />
          <button disabled={busy} onClick={create} className="px-3 py-1 rounded bg-indigo-600 text-white">Создать</button>
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="font-semibold mb-2">Список</div>
        <div className="divide-y">
          {list.map(g=>(
            <div key={g.id} className="py-2 flex justify-between items-center">
              <div><b>[{g.tag}]</b> {g.name}</div>
              <div className="text-sm text-gray-600">участников: {g.members}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
