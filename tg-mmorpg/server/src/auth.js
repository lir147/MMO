import jwt from 'jsonwebtoken'

export function signUser(userId, secret){
  return jwt.sign({ uid: userId }, secret, { expiresIn: '7d' })
}

export function auth(secret){
  return (req,res,next)=>{
    const h = req.headers.authorization || ''
    const t = h.replace('Bearer ','')
    try { req.user = jwt.verify(t, secret); next() } catch { res.status(401).json({error:'unauth'}) }
  }
}
