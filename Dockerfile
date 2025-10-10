FROM node:20

WORKDIR /starwars-api

COPY package*.json ./

RUN npm install --legacy-peer-deps --verbose

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]