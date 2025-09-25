import { useEffect, useRef, useState } from 'react'
export default function Arena({ wsEndpoint }:{ wsEndpoint:string }){
  const [messages, setMessages] = useState<string[]>([])
  const input = useRef<HTMLInputElement>(null)
  useEffect(()=>{
    const ws = new WebSocket(wsEndpoint)
    ws.onmessage = (ev)=>{
      const obj = JSON.parse(ev.data)
      if(obj.t==='presence') setMessages(m=>[`Онлайн: ${obj.online}`, ...m])
      if(obj.t==='chat.msg') setMessages(m=>[`${obj.from}: ${obj.text}`, ...m])
    }
    return ()=> ws.close()
  }, [wsEndpoint])
  return (
    <div>
      <div style={{display:'flex', gap:8}}>
        <input ref={input} placeholder="Написать в глобальный чат" style={{flex:1, padding:8, border:'1px solid #ccc', borderRadius:8}} />
        <button onClick={()=>{
          const ws = (window as any).ws || new WebSocket(wsEndpoint)
          ;(window as any).ws = ws
          ws.onopen = ()=> ws.send(JSON.stringify({ t:'chat.send', text: input.current!.value }))
          if(ws.readyState===1) ws.send(JSON.stringify({ t:'chat.send', text: input.current!.value }))
          input.current!.value=''
        }}>Отправить</button>
      </div>
      <div style={{marginTop:10, display:'grid', gap:6}}>
        {messages.map((m,i)=> <div key={i} style={{fontFamily:'monospace'}}>{m}</div>)}
      </div>
    </div>
  )
}
