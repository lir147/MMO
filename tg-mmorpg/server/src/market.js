import { db, nextId } from './store.js'

export function listItem(sellerId, payload){
  const id = nextId('list')
  const row = { id, seller_id: sellerId, ...payload, status:'active', created_at:new Date().toISOString() }
  db.listings.set(id, row)
  return row
}

export function queryListings(){
  return [...db.listings.values()].filter(l=>l.status==='active')
}
