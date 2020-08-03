FROM node:alpine
WORKDIR /usr/src/bot
COPY package.json ./
RUN npm install
RUN apk add --no-cache ffmpeg
COPY bot.js ./
CMD ["node" ,"bot.js"]
