import { useState } from 'react'
export default function CreateCharacter({ onCreate }:{ onCreate:(name:string, klass:'warrior'|'mage'|'ranger')=>void }){
  const [name,setName] = useState('')
  const [klass,setKlass] = useState<'warrior'|'mage'|'ranger'>('warrior')
  const valid = name.trim().length>=3
  return (
    <div className="card grid gap-3">
      <div className="title">Создать персонажа</div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ник (мин. 3 символа)" className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2" />
      <select value={klass} onChange={e=>setKlass(e.target.value as any)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
        <option value="warrior">Воин</option>
        <option value="mage">Маг</option>
        <option value="ranger">Следопыт</option>
      </select>
      <button disabled={!valid} onClick={()=>onCreate(name.trim(), klass)} className="btn disabled:opacity-50">Создать</button>
      {!valid && <div className="text-xs text-rose-300">Введите ник не короче 3 символов</div>}
    </div>
  )
}
