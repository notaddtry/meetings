FROM node:alpine

WORKDIR /server
COPY package*.json ./

RUN npm install
CMD ["npm","start"]