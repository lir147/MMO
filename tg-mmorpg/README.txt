tg-mmorpg patch

1) Бэкенд
   - Скопируй файлы из server/ поверх своего server/
   - Проверь .env: DATABASE_URL="file:./dev.db"
   - Выполни:
       cd server
       npx prisma db push
       npx prisma generate
       npm run start:dev
   - API слушает /api/* (как у тебя)

2) Фронтенд
   - Скопируй web/src/pages/* в свой проект (Vite/React)
   - Добавь роуты на /fight, /raid, /guild

Примечания
 - В архиве положен placeholder game.service.ts (чтобы не перегружать патч).
   Возьми полный исправленный game.service.ts из последнего сообщения чата и замени этот файл.
 - Схема Prisma включает lastRestAt и все связи.
