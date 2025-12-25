FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY app .

RUN npx sass css/main.scss:css/main.css --no-source-map --style compressed

EXPOSE 3000

CMD ["npx", "serve", ".", "-l", "tcp://0.0.0.0:3000"]
