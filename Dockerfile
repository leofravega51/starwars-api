FROM node:20

WORKDIR /starwars-api

COPY package*.json ./

RUN npm install --legacy-peer-deps --verbose

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "start:prod"]