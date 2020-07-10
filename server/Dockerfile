FROM node:14.5.0-alpine3.12

RUN mkdir /workdir

WORKDIR /workdir

COPY . .

RUN npm ci

ENTRYPOINT [ "npm", "start" ]
