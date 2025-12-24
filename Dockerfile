# Usar Node.js 22 con Alpine Linux (imagen muy ligera)
FROM node:22.21.1-alpine

# Instalar bash (Alpine viene con sh por defecto)
RUN apk add --no-cache bash

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto que usa Vite (por defecto 5173)
EXPOSE 5173

# Comando por defecto para iniciar el servidor de desarrollo
CMD ["npm", "run", "dev", "--", "--host"]
