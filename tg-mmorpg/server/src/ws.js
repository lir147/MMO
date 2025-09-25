import { WebSocketServer } from 'ws'

export function initWS(server){
  const wss = new WebSocketServer({ server, path: '/ws' })
  const clients = new Map() // ws -> { userId, username }

  function broadcast(obj){
    const msg = JSON.stringify(obj)
    for(const ws of clients.keys()) if(ws.readyState===ws.OPEN) ws.send(msg)
  }

  wss.on('connection', (ws, req)=>{
    const url = new URL(req.url, `http://${req.headers.host}`)
    const userId = Number(url.searchParams.get('uid')||0)
    const username = url.searchParams.get('u')||'player'
    clients.set(ws, { userId, username })
    broadcast({ t:'presence', online: clients.size })

    ws.on('message', (data)=>{
      let obj
      try { obj = JSON.parse(data) } catch { return }
      if(obj.t==='chat.send'){
        const meta = clients.get(ws)
        broadcast({ t:'chat.msg', from: meta.username, text: String(obj.text).slice(0,300), at: Date.now() })
      }
    })
    ws.on('close', ()=>{ clients.delete(ws); broadcast({ t:'presence', online: clients.size }) })
  })
}
