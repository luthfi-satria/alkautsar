FROM node:16.15.1-alpine

WORKDIR /app

EXPOSE 3000

COPY package.json .

# RUN npm install glob rimraf
RUN npm install

COPY . .
COPY .env.local .env

# RUN npx nestjs-command seeding:initial

ENV NODE_ENV=development
CMD ["npm", "run", "start:dev"]
