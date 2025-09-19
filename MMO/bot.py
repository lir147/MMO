
from aiogram import Bot, Dispatcher, types, executor
from characters import Warrior, Mage
from loot import loot_table

API_TOKEN = "7774994899:AAFZn45Q9uW5ts4SWC9WVypK7yf_eTFMH4I"

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

players = {}

@dp.message_handler(commands=['start'])
async def start(message: types.Message):
    players[message.from_user.id] = Warrior(message.from_user.first_name)
    await message.reply(f"Привет, {message.from_user.first_name}! Твой герой создан.")

@dp.message_handler(commands=['loot'])
async def loot_command(message: types.Message):
    player = players.get(message.from_user.id)
    if not player:
        await message.reply("Сначала создайте персонажа командой /start")
        return
    item = loot_table.get_random_item()
    if item:
        player.inventory.append(item)
        await message.reply(f"Поздравляем! Вы получили: {item.name}")
    else:
        await message.reply("Предмет не выпал.")

@dp.message_handler(commands=['inventory'])
async def inventory_command(message: types.Message):
    player = players.get(message.from_user.id)
    if not player:
        await message.reply("Сначала создайте персонажа командой /start")
        return
    if player.inventory:
        items = "
".join([i.name for i in player.inventory])
        await message.reply(f"Ваши предметы:
{items}")
    else:
        await message.reply("Ваш инвентарь пуст.")

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
