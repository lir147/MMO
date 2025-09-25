import { db } from './store.js'
export function getStages(){ return { locations: db.stages } }
