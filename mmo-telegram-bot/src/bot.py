import os, asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select
from src.db import AsyncSessionLocal
from src.models import User, Char, Item, Inventory
from src.utils import rate_limit
from src.game.logic import run_pve, run_pvp

BOT_TOKEN = os.getenv('BOT_TOKEN')
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(commands=['start'])
async def cmd_start(message: types.Message):
    async with AsyncSessionLocal() as s:
        # upsert user
        q = await s.execute(select(User).where(User.id==message.from_user.id))
        u = q.scalars().first()
        if not u:
            u = User(id=message.from_user.id, username=message.from_user.username or '', display_name=message.from_user.full_name)
            s.add(u)
            await s.commit()
        # ensure char
        q = await s.execute(select(Char).where(Char.user_id==u.id))
        c = q.scalars().first()
        if not c:
            c = Char(user_id=u.id, name=f"Hero{u.id%1000}", class_slug='warrior', hp=100, mp=50, atk=12, defn=6)
            s.add(c)
            await s.commit()
    await message.answer("Добро пожаловать в MMO-RPG! Используйте /status и /adventure")

@dp.message(commands=['status'])
async def cmd_status(message: types.Message):
    async with AsyncSessionLocal() as s:
        q = await s.execute(select(Char).where(Char.user_id==message.from_user.id))
        c = q.scalars().first()
        if not c:
            await message.answer("У вас нет персонажа. /start")
            return
        text = f"{c.name} (lvl {c.level})\nКласс: {c.class_slug}\nHP: {c.hp} ATK: {c.atk} DEF: {c.defn}\nEXP: {c.exp}"
        await message.answer(text)

@dp.message(commands=['adventure'])
@rate_limit(3)
async def cmd_adventure(message: types.Message):
    async with AsyncSessionLocal() as s:
        q = await s.execute(select(Char).where(Char.user_id==message.from_user.id))
        c = q.scalars().first()
        if not c:
            await message.answer("Создайте персонажа через /start")
            return
        res = await run_pve(s, c)
        await s.commit()
        if res['win']:
            await message.answer(f"Победа! +{res['reward']['gold']} gold, +{res['reward']['exp']} exp. {('Дроп: '+res['drop']) if res['drop'] else ''}")
        else:
            await message.answer("Вы проиграли приключение.")

# PvP команда: /duel <reply to user's message>
@dp.message(commands=['duel'])
async def cmd_duel(message: types.Message):
    if not message.reply_to_message or not message.reply_to_message.from_user:
        await message.answer('Ответьте на сообщение игрока, с которым хотите дуэль: /duel (reply)')
        return
    opponent = message.reply_to_message.from_user
    async with AsyncSessionLocal() as s:
        q = await s.execute(select(Char).where(Char.user_id==message.from_user.id))
        c1 = q.scalars().first()
        q = await s.execute(select(Char).where(Char.user_id==opponent.id))
        c2 = q.scalars().first()
        if not c1 or not c2:
            await message.answer('Один из игроков не имеет персонажа.')
            return
        winner = await run_pvp(s, c1, c2)
        await message.answer(f'Дуэль завершена! Победил: {winner.name}')
