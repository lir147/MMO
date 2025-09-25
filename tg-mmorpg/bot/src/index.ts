
import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

const BOT_TOKEN = process.env.BOT_TOKEN!;
const WEBAPP_URL = process.env.WEBAPP_URL!;

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN is missing');
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

bot.command('start', ctx => {
  const kb = new InlineKeyboard().webApp('Играть', WEBAPP_URL);
  return ctx.reply('Добро пожаловать в Shards! Открывай игру:', { reply_markup: kb });
});

bot.command('profile', async ctx => {
  return ctx.reply('Открой мини‑приложение, чтобы посмотреть профиль.');
});

bot.catch(err => console.error(err));

bot.start({ drop_pending_updates: true });
