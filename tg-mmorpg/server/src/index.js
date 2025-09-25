import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import { db, nextId } from './store.js'
import { signUser, auth } from './auth.js'
import { startBattle, playerAction, getCharacter, equipItem, allocate, raidInfo, raidHit, leaderboard } from './logic.js'

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))

const JWT_SECRET = process.env.JWT_SECRET || 'dev'

// Dev auth
app.post('/auth/telegram/init', (req,res)=>{
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
  if(!name || name.trim().length<3) return res.status(400).json({error:'bad_name'})
  const exists = [...db.characters.values()].find(c=>c.user_id===req.user.uid)
  if(exists) return res.status(400).json({error:'already_exists'})
  const c = { id: nextId('char'), user_id: req.user.uid, name: name.trim().slice(0,20), class:klass, level:1, exp:0,
    energy:100, max_energy:100, last_energy_ts: Date.now(),
    str: 5, int: 5, agi: 5, stat_points: 0, weapon_id: null, armor_id: null }
  db.characters.set(c.id, c)
  res.json({ character: c })
})

app.get('/me/character', (req,res)=>{ res.json(getCharacter(req.user.uid)) })
app.post('/me/inventory/equip', (req,res)=>{ const { itemId } = req.body; res.json(equipItem(req.user.uid, itemId)) })
app.post('/me/stats/allocate', (req,res)=>{ const { str=0,int=0,agi=0 } = req.body; res.json(allocate(req.user.uid, {str,int,agi})) })

app.get('/me/stages', (req,res)=>{ res.json({ locations: db.stages }) })
app.post('/me/battles/create', (req,res)=>{
  const { stageId } = req.body
  const stage = db.stages.flatMap(l=>l.stages).find(s=>s.id===stageId)
  if(!stage) return res.status(404).json({error:'stage_not_found'})
  const r = startBattle(req.user.uid, stage)
  if(r.error) return res.status(400).json(r)
  res.json(r)
})
app.post('/me/battles/action', (req,res)=>{ const { battleId, skill } = req.body; res.json(playerAction(req.user.uid, battleId, skill)) })

// Raids & Leaderboard
app.get('/raid', (req,res)=>{ res.json(raidInfo()) })
app.post('/me/raid/hit', (req,res)=>{ res.json(raidHit(req.user.uid)) })
app.get('/leaderboard', (req,res)=>{ res.json({ top: leaderboard() }) })

const server = http.createServer(app)
const PORT = Number(process.env.PORT||8080)
server.listen(PORT, ()=> console.log('API on http://localhost:'+PORT))
