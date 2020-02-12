FROM node:13.7.0-alpine3.10 AS node-modules

COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:12.13.1-alpine3.10 AS release

EXPOSE 8121

WORKDIR /usr/src/app

COPY --from=node-modules ./node_modules ./node_modules
COPY app ./app
COPY scripts ./scripts
COPY config ./config

CMD ["node", "app/index.js"]