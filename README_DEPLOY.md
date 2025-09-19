# MMO-RPG Telegram Bot — Deploy with Docker, Nginx & Certbot

## Шаги деплоя

1. Клонировать репозиторий на сервер.
2. Установить Docker и docker-compose.
3. Создать директории:
   ```bash
   mkdir -p nginx/conf.d certbot/www certbot/conf
   ```
4. В `nginx/conf.d/mmo.conf` заменить `mmo-bot.example.com` на ваш домен.
5. Выпустить сертификат Let's Encrypt:
   ```bash
   docker-compose run --rm certbot certonly --webroot -w /var/www/certbot -d mmo-bot.example.com --email you@example.com --agree-tos --no-eff-email
   ```
6. Обновить nginx конфиг для HTTPS (см. комментарий в docker-compose инструкции).
7. Перезапустить сервисы:
   ```bash
   docker-compose up -d
   docker-compose restart nginx
   ```

Теперь бот доступен по HTTPS на вашем домене.
