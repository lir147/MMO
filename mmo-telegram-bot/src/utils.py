import time, random
from functools import wraps
from aiogram import types

# простая защита от флуда: last_action timestamp per user in-memory
_last_action = {}

def rate_limit(seconds: int):
    def deco(func):
        @wraps(func)
        async def wrapper(message: types.Message, *args, **kwargs):
            uid = message.from_user.id
            now = time.time()
            last = _last_action.get(uid, 0)
            if now - last < seconds:
                await message.reply(f"Подождите {int(seconds - (now - last))} сек.")
                return
            _last_action[uid] = now
            return await func(message, *args, **kwargs)
        return wrapper
    return deco

def rnd_seeded():
    return random.Random()
