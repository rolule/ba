FROM node:12-alpine3.10

EXPOSE 80
WORKDIR /var/app/

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY index.js .

CMD npm start