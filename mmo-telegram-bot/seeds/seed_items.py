# seeds/seed_items.py
import json
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.models import Base, Item

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite+aiosqlite:///./mmo.db')

async def main():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with AsyncSessionLocal() as s:
        with open('src/assets/items_full.json','r',encoding='utf-8') as f:
            items = json.load(f)
        for it in items:
            exists = await s.execute("SELECT id FROM items WHERE slug=:slug", {'slug': it['slug']})
            row = exists.first()
            if row:
                continue
            item = Item(slug=it['slug'], name=it['name'], type=it.get('type','misc'), rarity=it.get('rarity','common'), stats=it.get('stats',{}), price=it.get('price',0))
            s.add(item)
        await s.commit()
    await engine.dispose()

if __name__ == '__main__':
    asyncio.run(main())
