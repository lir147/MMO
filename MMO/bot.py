from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
import asyncio
from characters import Warrior, Mage, Archer
from loot import loot_table

API_TOKEN = "7774994899:AAFZn45Q9uW5ts4SWC9WVypK7yf_eTFMH4I"

bot = Bot(token=API_TOKEN)
dp = Dispatcher()
players = {}

# Ссылка на изображение игрового интерфейса
GAME_SCREEN_IMAGE = "https://i.imgur.com/your_game_screen.png"

# Выбор класса при старте
@dp.message(Command("start"))
async def start(message: types.Message):
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(text="⚔️ Воин", callback_data="class_warrior")],
        [types.InlineKeyboardButton(text="🪄 Маг", callback_data="class_mage")],
        [types.InlineKeyboardButton(text="🏹 Лучник", callback_data="class_archer")]
    ])
    await message.answer("Выберите класс персонажа:", reply_markup=keyboard)

# Обработка выбора класса
async def class_selection(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    name = callback.from_user.first_name

    if callback.data == "class_warrior":
        players[user_id] = Warrior(name)
        class_name = "Воин"
    elif callback.data == "class_mage":
        players[user_id] = Mage(name)
        class_name = "Маг"
    elif callback.data == "class_archer":
        players[user_id] = Archer(name)
        class_name = "Лучник"
    else:
        return

    player = players[user_id]
    keyboard = game_menu()
    await callback.message.answer_photo(
        photo=GAME_SCREEN_IMAGE,
        caption=f"Добро пожаловать, {name}! Ваш класс: {class_name}\n"
                f"❤️ HP: {player.health}  ⚡ MP: {player.mana}  🗡️ Сила: {player.strength}\n"
                f"🛡️ Ловкость: {player.agility}  🧠 Интеллект: {player.intelligence}\n"
                "Выберите действие:",
        reply_markup=keyboard
    )

# Меню игрового интерфейса
def game_menu():
    keyboard = types.InlineKeyboardMarkup(inline_keyboard=[
        [
            types.InlineKeyboardButton("🗺️ Показать карту", callback_data="show_map"),
            types.InlineKeyboardButton("⚔️ Получить лут", callback_data="get_loot")
        ],
        [
            types.InlineKeyboardButton("📦 Инвентарь", callback_data="show_inventory"),
            types.InlineKeyboardButton("🔄 Персонаж", callback_data="show_character")
        ]
    ])
    return keyboard

# Обработка действий в игре
async def game_actions(callback: types.CallbackQuery):
    user_id = callback.from_user.id
    player = players.get(user_id)
    if not player:
        await callback.message.answer("Сначала создайте персонажа командой /start")
        return

    if callback.data == "show_map":
        await callback.message.answer_photo(
            photo=GAME_SCREEN_IMAGE,
            caption="🌍 Ваша карта. Выберите действие:",
            reply_markup=game_menu()
        )
    elif callback.data == "get_loot":
        item = loot_table.get_random_item()
        if item:
            player.inventory.append(item)
            await callback.message.answer(f"🎉 Поздравляем! Вы получили: {item.name}")
        else:
            await callback.message.answer("💀 Предмет не выпал.")
    elif callback.data == "show_inventory":
        if player.inventory:
            items = "\n".join([i.name for i in player.inventory])
            await callback.message.answer(f"📦 Ваши предметы:\n{items}")
        else:
            await callback.message.answer("📭 Ваш инвентарь пуст.")
    elif callback.data == "show_character":
        await callback.message.answer(
            f"🧑‍💻 Персонаж: {player.name}\n"
            f"❤️ HP: {player.health}\n"
            f"⚡ MP: {player.mana}\n"
            f"🗡️ Сила: {player.strength}\n"
            f"🛡️ Ловкость: {player.agility}\n"
            f"🧠 Интеллект: {player.intelligence}\n"
            f"📦 Инвентарь: {len(player.inventory)} предметов"
        )

# Регистрируем обработчики
dp.callback_query.register(class_selection, lambda c: c.data.startswith("class_"))
dp.callback_query.register(game_actions, lambda c: c.data in ["show_map","get_loot","show_inventory","show_character"])

if __name__ == "__main__":
    print("Бот запущен...")
    asyncio.run(dp.start_polling(bot))
