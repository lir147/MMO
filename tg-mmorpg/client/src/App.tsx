import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { init, createChar } from './api'
import CreateCharacter from './components/CreateCharacter'
import Dashboard from './components/Dashboard'

export default function App(){
  const [token,setToken] = useState<string|null>(null)
  const [user,setUser] = useState<any>(null)
  const [character,setCharacter] = useState<any>(null)

  useEffect(()=>{ WebApp.ready(); init().then(d=>{ setToken(d.token); setUser(d.user); setCharacter(d.character) }) },[])

  if(!token) return <div className="p-4 text-slate-200">Загрузка…</div>

  return (
    <div className="min-h-screen text-slate-100 p-3 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-3">MMORPG Mini App</h1>
      {!character ? (
        <CreateCharacter onCreate={async(name,klass)=>{ const d=await createChar(token!, name, klass); setCharacter(d.character) }} />
      ) : (
        <Dashboard token={token!} character={character} onUpdate={setCharacter} />
      )}
    </div>
  )
}
