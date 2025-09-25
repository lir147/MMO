import { ReactNode, useState } from 'react'
export function Tabs({ tabs }:{ tabs: { key:string; label:string; view:ReactNode }[] }){
  const [k,setK] = useState(tabs[0].key)
  return (
    <div>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        {tabs.map(t=> <button key={t.key} onClick={()=>setK(t.key)} style={{padding:'6px 10px', border:'1px solid #ccc', borderRadius:8, background:k===t.key?'#efefef':'#fff'}}>{t.label}</button>)}
      </div>
      <div>{tabs.find(t=>t.key===k)?.view}</div>
    </div>
  )
}
