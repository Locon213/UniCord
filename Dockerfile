FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.cjs"]
