# UniCord

Universal Discord SDK & Framework. Поддерживает OAuth2 PKCE, REST-клиент, отправку вебхуков и примеры для Node и PHP.

## Быстрый старт

```bash
npm install
npm run build
npm test
```

### Пример входа на фронтенде
```html
<script src="https://cdn.jsdelivr.net/npm/unicord@0.1.0/dist/index.iife.js"></script>
<script>
const oauth = new UniCord.OAuth2({
  clientId: '<YOUR_CLIENT_ID>',
  redirectUri: 'https://example.com/callback',
  backendTokenURL: 'https://your-backend/api/auth/discord',
  defaultScopes: ['identify']
});
function login() { oauth.login(); }
</script>
```

### Обработка колбэка
```html
<script>
const oauth = new UniCord.OAuth2({
  clientId: '<YOUR_CLIENT_ID>',
  redirectUri: 'https://example.com/callback',
  backendTokenURL: 'https://your-backend/api/auth/discord'
});
oauth.handleCallback().then(r=>console.log(r.user));
</script>
```

## Node.js пример
```bash
cd examples/node-server
cp .env.example .env
npm install
npm run dev
```
Откройте `examples/html/login.html` через любой статический сервер (`npx serve examples/html`).

## PHP пример
Разместите содержимое `examples/php-server` на сервере PHP. Файл `api/auth_discord.php` обрабатывает обмен кода на токен.

## Публикация IIFE на CDN
После `npm publish` файл доступен:
```
https://cdn.jsdelivr.net/npm/unicord@0.1.0/dist/index.iife.js
```

## Безопасность
- Никогда не храните `client_secret` на фронтенде.
- Используйте PKCE, `state` и HTTPS.
- Сохраняйте токены только на сервере, в браузере храните лишь сессионный идентификатор (HttpOnly cookie).
- Очищайте `sessionStorage` после колбэка.

## Лицензия
MIT
