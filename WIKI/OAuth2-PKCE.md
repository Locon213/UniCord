# OAuth2 PKCE

PKCE (Proof Key for Code Exchange) защищает обмен кода на токен. Клиент генерирует `code_verifier` и `code_challenge`. Сервер проверяет их соответствие, что предотвращает подмену кода.

Также используется параметр `state` для защиты от CSRF. Сохраняйте `state` в sessionStorage и сверяйте его после редиректа.
