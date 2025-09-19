import os
from fastapi import FastAPI, Request, HTTPException
import stripe
from sqlalchemy import select
from src.db import AsyncSessionLocal
from src.models import User

app = FastAPI()
stripe.api_key = os.getenv('STRIPE_SECRET')
ENDPOINT_SECRET = os.getenv('STRIPE_ENDPOINT_SECRET')

@app.post('/webhook/stripe')
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, ENDPOINT_SECRET)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Webhook error: {e}')

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})
        user_id = int(metadata.get('user_id')) if metadata.get('user_id') else None
        purchase_type = metadata.get('purchase_type')
        amount = session.get('amount_total',0)
        if user_id and purchase_type:
            async with AsyncSessionLocal() as s:
                q = await s.execute(select(User).where(User.id==user_id))
                user = q.scalars().first()
                if user:
                    if purchase_type=='gold_pack_small':
                        user.gold = (user.gold or 0) + 1000
                    elif purchase_type=='premium_30d':
                        import datetime
                        user.premium_until = (user.premium_until or datetime.datetime.utcnow()) + datetime.timedelta(days=30)
                    await s.commit()
    return {'ok': True}
