
# Shards — Ligmar Feature Pack (FIXED, DEV SQLite)

Готовый набор с фичами (гильдии, арена, контракты, крафт, рынок, босс, путешествия) и **синхронизированными** файлами:
- Исправлены ошибки TS (методы сервиса существуют и совпадают с контроллером).
- `Item.stats` — `String` для SQLite (JSON сериализуем вручную).
- `BigInt` сериализуется в JSON (патч в `main.ts`).
- Захват `?ref=` в middleware.

## Запуск
```bash
# 1) API
cd server
npm i
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push --force-reset --schema=prisma/schema.prisma
npm run dev   # http://localhost:10000

# 2) Web (простая панель для проверки)
cd ../web
npm i
npm run dev   # http://localhost:5173
```
В DEV `DEV_MODE=1` — подпись Telegram отключена. Для реального Mini App: `DEV_MODE=0` и HTTPS‑туннель на порт 5173.

## Эндпоинты
- `GET  /api/me`
- `POST /api/fight/start`  { enemy: "slime" }
- `POST /api/daily/claim`
- `POST /api/quest/contract/new`
- `POST /api/quest/contract/progress` { questId, amount }
- `POST /api/quest/contract/claim`    { questId }
- `POST /api/guild/create`  { name, tag }
- `POST /api/guild/join`    { guildId }
- `POST /api/guild/leave`
- `POST /api/arena/queue`
- `GET  /api/market/listings`
- `POST /api/market/list`   { itemId, price }
- `POST /api/market/buy`    { listingId }
- `POST /api/craft/mine`
- `POST /api/craft/craft`   { recipe: "iron_sword" }
- `POST /api/travel`        { location: "Forest" }
- `GET  /api/worldboss/status`
- `POST /api/worldboss/fight`
