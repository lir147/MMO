import { useEffect, useState } from 'react'
import { getBoss, hitBoss, getContrib } from '../api'
export default function WorldBoss({ token }:{ token:string }){
  const [boss,setBoss] = useState<any>(null)
  const [dmg,setDmg] = useState(123)
  const [table,setTable] = useState<any[]>([])
  useEffect(()=>{ getBoss().then(setBoss); getContrib().then(setTable) },[])
  return (
    <div style={{display:'grid', gap:10}}>
      {boss && <div style={{border:'1px solid #ddd', padding:10, borderRadius:8}}>
        <div style={{fontWeight:600}}>{boss.name}</div>
        <div>HP: {boss.hp} / {boss.max_hp}</div>
      </div>}
      <div style={{display:'flex', gap:8}}>
        <input type="number" value={dmg} onChange={e=>setDmg(Number(e.target.value))} style={{padding:8, border:'1px solid #ccc', borderRadius:8}}/>
        <button onClick={async()=>{ const r=await hitBoss(token, dmg); setBoss(r.boss); const t=await getContrib(); setTable(t) }}>Атк</button>
      </div>
      <div>
        <div style={{fontWeight:600, marginBottom:6}}>Таблица вкладов</div>
        {table.map((r,i)=> <div key={i}>Игрок {r.userId}: {r.dmg}</div>)}
      </div>
    </div>
  )
}
