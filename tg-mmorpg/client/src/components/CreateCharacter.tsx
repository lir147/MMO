import { useState } from 'react'
export default function CreateCharacter({ onCreate }:{ onCreate:(name:string, klass:'warrior'|'mage'|'ranger')=>void }){
  const [name,setName] = useState('Герой')
  const [klass,setKlass] = useState<'warrior'|'mage'|'ranger'>('warrior')
  return (
    <div style={{display:'grid', gap:8}}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Имя" style={{padding:8, border:'1px solid #ccc', borderRadius:8}}/>
      <select value={klass} onChange={e=>setKlass(e.target.value as any)} style={{padding:8, border:'1px solid #ccc', borderRadius:8}}>
        <option value="warrior">Воин</option>
        <option value="mage">Маг</option>
        <option value="ranger">Следопыт</option>
      </select>
      <button onClick={()=>onCreate(name, klass)} style={{padding:10, border:'1px solid #333', borderRadius:8}}>Создать персонажа</button>
    </div>
  )
}
