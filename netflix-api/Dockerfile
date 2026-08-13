FROM node:lts-alpine AS builder

USER node

WORKDIR /home/node/app

COPY --chown=node:node  package.json package-lock.json ./

RUN npm ci

COPY --chown=node:node . .

RUN npm run build

FROM node:lts-alpine

EXPOSE 3000

USER node

WORKDIR /home/node/app

COPY --chown=node:node package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder --chown=node:node /home/node/app/dist /home/node/app/dist

CMD [ "npm", "run", "start" ]