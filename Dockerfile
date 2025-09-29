FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Build (transpile TypeScript)
RUN npm run build || true

FROM node:18-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copiar package.json para instalar deps de produção
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
