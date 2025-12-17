FROM node:25-alpine

WORKDIR /app

# Объявляем ARG для переменной окружения
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

CMD ["npm", "start"]

EXPOSE 3000