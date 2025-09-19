from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
import asyncio
from characters import Warrior
from loot import loot_table

API_TOKEN = "7774994899:AAFZn45Q9uW5ts4SWC9WVypK7yf_eTFMH4I"

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

players = {}

@dp.message(Command("start"))
async def start(message: types.Message):
    players[message.from_user.id] = Warrior(message.from_user.first_name)
    await message.answer(f"Привет, {message.from_user.first_name}! Твой герой создан.")

@dp.message(Command("loot"))
async def loot_command(message: types.Message):
    player = players.get(message.from_user.id)
    if not player:
        await message.answer("Сначала создайте персонажа командой /start")
        return
    item = loot_table.get_random_item()
    if item:
        player.inventory.append(item)
        await message.answer(f"Поздравляем! Вы получили: {item.name}")
    else:
        await message.answer("Предмет не выпал.")

@dp.message(Command("inventory"))
async def inventory_command(message: types.Message):
    player = players.get(message.from_user.id)
    if not player:
        await message.answer("Сначала создайте персонажа командой /start")
        return
    if player.inventory:
        items = "\n".join([i.name for i in player.inventory])
        await message.answer(f"Ваши предметы:\n{items}")
    else:
        await message.answer("Ваш инвентарь пуст.")

if __name__ == '__main__':
    asyncio.run(dp.start_polling(bot))
