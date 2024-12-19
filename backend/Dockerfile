FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Usar ts-node con --transpile-only para ignorar errores de tipos
CMD ["npx", "ts-node-dev", "--transpile-only", "app.ts"]