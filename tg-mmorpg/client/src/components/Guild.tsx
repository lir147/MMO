import { useState } from 'react'
export default function Guild({ token }:{ token:string }){
  const [name,setName] = useState('Герои Рассвета')
  const [created,setCreated] = useState<any>(null)
  return (
    <div style={{display:'grid', gap:8}}>
      <div style={{display:'flex', gap:8}}>
        <input value={name} onChange={e=>setName(e.target.value)} style={{flex:1, padding:8, border:'1px solid #ccc', borderRadius:8}}/>
        <button onClick={async()=>{
          const r = await fetch((import.meta as any).env.VITE_API_URL + '/me/guilds', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token }, body: JSON.stringify({ name }) })
          setCreated(await r.json())
        }}>Создать</button>
      </div>
      {created && <pre style={{background:'#f6f6f6', padding:8, borderRadius:8}}>{JSON.stringify(created,null,2)}</pre>}
    </div>
  )
}
