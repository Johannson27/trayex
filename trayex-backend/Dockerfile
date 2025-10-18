FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero (mejor cache)
COPY package*.json ./
RUN npm install

# Copia el resto
COPY . .

# Genera cliente y aplica migraciones existentes
RUN npx prisma generate

ENV PORT=4000
EXPOSE 4000

# En dev: aplica migraciones y levanta
CMD sh -c "npx prisma migrate deploy && npm run dev"
