FROM node:25-alpine

WORKDIR /app

# Объявляем ARG для переменной окружения
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Production build вместо dev сервера
RUN npm run build

# Используем serve для production
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]