# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.10.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /app

# Copie package.json e package-lock.json
COPY package*.json ./

# Instale as dependências de produção
RUN npm ci --omit=dev

# Copie o restante dos arquivos da aplicação
COPY . . 


COPY tsconfig.json ./

# Compilar TypeScript
RUN npm run build

# Run the application as a non-root user.
USER node

# Exponha a porta que a aplicação usa
EXPOSE 3000

# Inicie a aplicação
CMD ["node", "dist/app.js"]



