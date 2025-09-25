# MMORPG Mini App (Telegram)

## Быстрый старт (dev)
1) Server:
   ```bash
   cd server && cp .env.example .env && npm i && npm run dev
   ```
2) Client:
   ```bash
   cd client && npm i && echo "VITE_API_URL=http://localhost:8080" > .env && npm run dev
   ```
3) Bot (опционально):
   ```bash
   cd bot && npm i && echo "BOT_TOKEN=<your-token>
MINI_APP_URL=http://localhost:5173" > .env && npm run dev
   ```
4) Откройте клиент на http://localhost:5173

## Примечания
- Авторизация через Telegram initData пока заглушена — замените на HMAC-проверку.
- Сервер хранит данные в памяти; при рестарте прогресс сбрасывается.
- Вкладки: Город / Арена (WS чат+presence) / Гильдия / Рынок / Мировой босс.
