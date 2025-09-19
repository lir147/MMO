import random, asyncio
from sqlalchemy import select
from src.models import Char, Item, Inventory
from .balance import calc_damage

# Простейшая PvE encounter
async def run_pve(session, char:Char):
    # генерация монстра
    mob_level = max(1, char.level + random.choice([-1,0,1]))
    mob_atk = 5 + mob_level * 2
    mob_def = 2 + mob_level
    mob_hp = 20 + mob_level * 10
    # симуляция простой атаки
    # игрок наносит один удар
    dmg = calc_damage(char.atk, 1.0, mob_def, critical=(random.random()<0.1))
    mob_hp -= dmg
    win = mob_hp <= 0
    reward = {'gold': random.randint(5, 20) + char.level*2, 'exp': random.randint(10,30) + char.level*5}
    drop = None
    if win:
        # шанс дропа редкого
        r = random.random()
        if r < 0.05:
            # найдем редкий предмет в БД
            q = await session.execute(select(Item).where(Item.rarity=='rare'))
            it = q.scalars().first()
            if it:
                inv = Inventory(char_id=char.id, item_id=it.id, qty=1)
                session.add(inv)
                drop = it.name
    return {'win': win, 'reward': reward, 'drop': drop}

# Простейший PvP duel (sync logic, returns winner id)
async def run_pvp(session, char_a:Char, char_b:Char):
    # очередь ходов: A then B
    a_hp = char_a.hp
    b_hp = char_b.hp
    turn = 0
    while a_hp>0 and b_hp>0 and turn < 20:
        if turn % 2 == 0:
            dmg = calc_damage(char_a.atk, 1.0, char_b.defn, critical=(random.random()<0.1))
            b_hp -= dmg
        else:
            dmg = calc_damage(char_b.atk, 1.0, char_a.defn, critical=(random.random()<0.1))
            a_hp -= dmg
        turn += 1
    if a_hp>0 and b_hp<=0:
        return char_a
    if b_hp>0 and a_hp<=0:
        return char_b
    # tie -> higher hp wins
    return char_a if a_hp>=b_hp else char_b
