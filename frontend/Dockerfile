FROM node:14.2-stretch-slim as builder

RUN mkdir /workdir

WORKDIR /workdir

COPY . .

RUN npm ci
RUN npm run build

FROM nginx:1.19

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workdir/dist/ /usr/share/nginx/html/
