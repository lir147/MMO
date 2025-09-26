import React, { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function SetupScreen(){
  const [data,setData]=useState<any>(null)
  const [name,setName]=useState('')
  const [cls,setCls]=useState('warrior')
  const [gender,setGender]=useState('male')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)

  useEffect(()=>{ api('/character/bootstrap').then((d:any)=>{ setData(d); setCls(d.classes[0].code) }) },[])

  const submit = async ()=>{
    try{
      setLoading(true); setError(null)
      await api('/character/setup',{ name, class: cls, gender })
      window.location.reload()
    }catch(e:any){
      setError(e.message || 'Ошибка')
    }finally{
      setLoading(false)
    }
  }

  if(!data) return null
  return (
    <div className="max-w-xl mx-auto card p-4 space-y-3">
      <h2 className="text-lg font-semibold">Создание персонажа</h2>

      <label className="block">
        <span className="text-sm opacity-80">Ник</span>
        <input className="input w-full" value={name} onChange={e=>setName(e.target.value)} placeholder="Ваш ник" />
      </label>

      <div>
        <div className="text-sm opacity-80 mb-1">Класс</div>
        <div className="grid grid-cols-3 gap-2">
          {data.classes.map((c:any) => (
            <button key={c.code} className={`btn ${cls===c.code?'btn-primary':''}`} onClick={()=>setCls(c.code)}>
              {c.code}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm opacity-80 mb-1">Пол</div>
        <div className="flex gap-2">
          {data.genders.map((g:string) => (
            <button key={g} className={`btn ${gender===g?'btn-primary':''}`} onClick={()=>setGender(g)}>
              {g==='male'?'Мужской':'Женский'}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" disabled={loading || name.length < data.nameRules.min} onClick={submit}>Создать</button>
      {error && <div className="text-danger">{error}</div>}
    </div>
  )
}