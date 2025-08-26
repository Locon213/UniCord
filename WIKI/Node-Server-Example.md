# Node.js пример

Пример на Express принимает POST `/api/auth/discord` с полями `{ code, code_verifier, redirect_uri }`. Он вызывает `exchangeCodeForTokenNode`, сохраняет токены в памяти и выдаёт HttpOnly cookie `unicord_sid`.

Команды запуска:
```bash
cd examples/node-server
cp .env.example .env
npm install
npm run dev
```
