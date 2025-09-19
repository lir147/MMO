from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
import asyncio

API_TOKEN = "7774994899:AAFZn45Q9uW5ts4SWC9WVypK7yf_eTFMH4I"
bot = Bot(token=API_TOKEN)
dp = Dispatcher()

WEB_APP_URL = "https://lir147.github.io/MMO-WebApp/"  # сюда вставь ссылку на веб-приложение

@dp.message(Command("start"))
async def start(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Открыть игру", web_app=WebAppInfo(url=WEB_APP_URL))]
    ])
    await message.answer("Нажмите кнопку, чтобы открыть игру:", reply_markup=keyboard)

if __name__ == "__main__":
    asyncio.run(dp.start_polling(bot))
