FROM node:18.18-alpine as base

ARG PAYLOAD_SECRET
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET

FROM base as builder

WORKDIR /home/node/app
COPY package*.json ./

COPY . .
RUN yarn add cross-env payload
RUN yarn build

FROM base as runtime

ENV NODE_ENV=production
ENV PAYLOAD_CONFIG_PATH=src/payload/payload.config.ts

WORKDIR /home/node/app
COPY package*.json  ./

RUN yarn install --production

COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/build ./build
COPY --from=builder /home/node/app/.next ./.next

EXPOSE 3000

CMD ["node", "dist/server.js"]
