import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { db, nextId } from './store.js'
import { signUser, auth } from './auth.js'
import { getStages } from './stages.js'
import { startBattle, resolveBattle } from './battles.js'
import { createGuild, getGuild } from './guilds.js'
import { listItem, queryListings } from './market.js'
import { currentBoss, hitBoss, contributions } from './world.js'
import { initWS } from './ws.js'
import http from 'http'

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))

const JWT_SECRET = process.env.JWT_SECRET || 'dev'

app.post('/auth/telegram/init', (req,res)=>{
  const { initData } = req.body // TODO: validate HMAC from Telegram
  const tg_user_id = Number((Date.now()%1e9).toString())
  let user = [...db.users.values()].find(u=>u.tg_user_id===tg_user_id)
  if(!user){ user = { id: nextId('user'), tg_user_id, username: 'player'+tg_user_id }
    db.users.set(user.id, user)
  }
  const token = signUser(user.id, JWT_SECRET)
  const character = [...db.characters.values()].find(c=>c.user_id===user.id) || null
  res.json({ token, user, character })
})

app.use('/me', auth(JWT_SECRET))

app.post('/me/characters', (req,res)=>{
  const { name, class:klass } = req.body
  const exists = [...db.characters.values()].find(c=>c.user_id===req.user.uid)
  if(exists) return res.status(400).json({error:'already_exists'})
  const c = { id: nextId('char'), user_id: req.user.uid, name, class:klass, level:1, exp:0, energy:100, max_energy:100 }
  db.characters.set(c.id, c)
  res.json({ character: c })
})

app.get('/me/stages', (req,res)=>{ res.json(getStages()) })

app.post('/me/battles/start', (req,res)=>{
  const { stageId } = req.body
  const r = startBattle(req.user.uid, stageId)
  if(r.error) return res.status(400).json(r)
  res.json({ ok:true, snapshot: r.snapshot })
})

app.post('/me/battles/resolve', (req,res)=>{
  const { stageId } = req.body
  const r = resolveBattle(req.user.uid, stageId)
  res.json(r)
})

// Guilds
app.post('/me/guilds', (req,res)=>{
  const { name } = req.body
  const g = createGuild(req.user.uid, name)
  res.json(g)
})
app.get('/guilds/:id', (req,res)=>{ const g = getGuild(req.params.id); if(!g) return res.sendStatus(404); res.json(g) })

// Market
app.get('/market/listings', (req,res)=>{ res.json({ items: queryListings() }) })
app.post('/me/market/listings', (req,res)=>{
  const row = listItem(req.user.uid, req.body)
  res.json(row)
})

// World boss
app.get('/world/boss/current', (req,res)=>{ res.json(currentBoss()) })
app.post('/me/world/boss/hit', (req,res)=>{
  const { dmg } = req.body
  res.json(hitBoss(req.user.uid, Math.max(1, Number(dmg||0))))
})
app.get('/world/boss/contrib', (req,res)=>{ res.json(contributions()) })

const server = http.createServer(app)
initWS(server)
const PORT = Number(process.env.PORT||8080)
server.listen(PORT, ()=> console.log('API+WS on http://localhost:'+PORT))
