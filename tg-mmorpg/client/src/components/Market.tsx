import { useEffect, useState } from 'react'
import { getListings } from '../api'
export default function Market(){
  const [items,setItems] = useState<any[]>([])
  useEffect(()=>{ getListings().then(d=>setItems(d.items||[])) },[])
  return (
    <div style={{display:'grid', gap:8}}>
      {items.map(it=> <div key={it.id} style={{border:'1px solid #ddd', padding:10, borderRadius:8}}>
        Листинг #{it.id} • цена {it.price} {it.currency}
      </div>)}
      {items.length===0 && <div>Пока нет листингов.</div>}
    </div>
  )
}
