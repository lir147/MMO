
# Shards — Telegram Mini MMORPG (MVP)

Локальный запуск по шагам:

## Предусловия
- Node.js 20+ и pnpm (`npm i -g pnpm`) или npm/yarn
- Docker Desktop (или docker + docker-compose)
- Git
- (Опционально) ngrok или cloudflared для https‑туннеля

## 1) Создать бота в Telegram
В @BotFather → `/newbot` → получите **BOT_TOKEN**.

## 2) Настроить .env
Заполните файлы:
- `server/.env`
- `bot/.env`
- `web/.env`

## 3) Поднять БД и Redis
```bash
docker compose up -d
```

## 4) Установить зависимости и миграции
```bash
# API
cd server
pnpm i
pnpm prisma generate
pnpm prisma migrate dev --name init

# Web
cd ../web
pnpm i

# Bot
cd ../bot
pnpm i
```

## 5) Запустить dev‑серверы
```bash
# API
cd server
pnpm dev  # http://localhost:8080

# Web
cd web
pnpm dev  # http://localhost:5173

# Bot
cd bot
pnpm dev  # long polling
```

## 6) Debug без Telegram
Откройте http://localhost:5173 — сервер примет DEV пользователя, если включён `DEV_MODE=1` в `server/.env`.

## 7) Полный прогон в Telegram
Поднимите ngrok для портов 5173 и 8080, пропишите https URL в `.env` и нажмите «Играть» в боте.

Траблшутинг и детали см. в разделе «Локальный запуск» в канвасе.
