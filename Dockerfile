FROM node:18.18-alpine as base

ARG PAYLOAD_SECRET
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET

# Install necessary packages
RUN apk add --no-cache curl

# Create a new user 'vector' and switch to it
RUN addgroup -S vector && adduser -S vector -G vector
USER vector

RUN curl -sSL https://logs.betterstack.com/setup-vector/docker/BnUe5vgmrxRUTZsmGrrM9KcQ \
  -o /tmp/setup-vector.sh && \
  bash /tmp/setup-vector.sh

USER root


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

EXPOSE 3000

CMD ["node", "dist/server.js"]