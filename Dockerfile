# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Instala python3 e ferramentas de compilação necessárias para o node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Instala dependências e atualiza lockfile em uma etapa
RUN npm install --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 