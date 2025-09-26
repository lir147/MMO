
import React from 'react'
export function Bar({ value, max, color='accent' }: { value: number; max: number; color?: 'accent'|'gold'|'shard'|'success'|'danger'}) {
  const p = Math.max(0, Math.min(100, Math.round((value/max)*100)));
  const colorMap:any = { accent:'bg-accent', gold:'bg-gold', shard:'bg-shard', success:'bg-success', danger:'bg-danger' }
  return <div className="progress"><span className={colorMap[color]} style={{ width: `${p}%` }} /></div>
}
