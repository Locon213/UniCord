FROM node:18-alpine AS builder

# Устанавливаем зависимости для сборки
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Продакшн образ
FROM node:18-alpine AS production

# Устанавливаем dumb-init для корректного завершения процессов
RUN apk add --no-cache dumb-init

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем только продакшн зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем собранные файлы из builder
COPY --from=builder /app/dist ./dist

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт (если нужен для веб-хуков)
EXPOSE 3000

# Используем dumb-init для корректной обработки сигналов
ENTRYPOINT ["dumb-init", "--"]

# Запускаем приложение
CMD ["node", "dist/index.cjs"]
