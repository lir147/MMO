import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Добро пожаловать в MMORPG Mini App!', {
    reply_markup: {
      inline_keyboard: [[{ text: '▶️ Играть', web_app: { url: process.env.MINI_APP_URL || 'http://localhost:5173' } }]]
    }
  })
})

console.log('Bot running')
