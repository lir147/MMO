import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { init, createChar } from './api'
import { Tabs } from './components/Tabs'
import CreateCharacter from './components/CreateCharacter'
import Dashboard from './components/Dashboard'
import Arena from './components/Arena'
import Guild from './components/Guild'
import Market from './components/Market'
import WorldBoss from './components/WorldBoss'

export default function App(){
  const [token,setToken] = useState<string|null>(null)
  const [user,setUser] = useState<any>(null)
  const [character,setCharacter] = useState<any>(null)

  useEffect(()=>{ WebApp.ready(); init().then(d=>{ setToken(d.token); setUser(d.user); setCharacter(d.character) }) },[])

  if(!token) return <div style={{padding:12}}>Загрузка…</div>
  if(!character) return <div style={{padding:12}}>
    <h3>Создать персонажа</h3>
    <CreateCharacter onCreate={async(name,klass)=>{ const d=await createChar(token!, name, klass); setCharacter(d.character) }} />
  </div>

  const tabs = [
    { key:'dash', label:'Город', view:<Dashboard token={token!} character={character} onUpdate={setCharacter} /> },
    { key:'arena', label:'Арена', view:<Arena wsEndpoint={`${location.origin.replace('http','ws')}/ws?uid=${user.id}&u=${encodeURIComponent(user.username)}`} /> },
    { key:'guild', label:'Гильдия', view:<Guild token={token!} /> },
    { key:'market', label:'Рынок', view:<Market /> },
    { key:'world', label:'Мировой босс', view:<WorldBoss token={token!} /> }
  ]

  return (
    <div style={{padding:12}}>
      <h2 style={{margin:'8px 0'}}>MMORPG Mini App</h2>
      <div style={{marginBottom:10}}>Игрок: {user?.username}</div>
      <Tabs tabs={tabs} />
    </div>
  )
}
