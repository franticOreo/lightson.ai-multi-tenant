FROM node:18.18-alpine as base

RUN echo "Hello ya KENT"

ARG PAYLOAD_SECRET

# Set environment variables
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET

FROM base as builder

WORKDIR /home/node/app
COPY package*.json ./

COPY . .
RUN yarn add cross-env payload
RUN yarn build

FROM base as runtime

# Install dependencies for Better Stack logging tool
RUN apk add --no-cache curl bash
RUN curl -sSL https://logs.betterstack.com/setup-vector/ubuntu/McfhGFLH516DTNeH5oA4nxC6 \
    -o /tmp/setup-vector.sh && \
    bash /tmp/setup-vector.sh

ENV NODE_ENV=production
ENV PAYLOAD_CONFIG_PATH=src/payload/payload.config.ts

WORKDIR /home/node/app
COPY package*.json  ./

RUN yarn install --production

COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/build ./build

EXPOSE 3000

CMD ["node", "dist/server.js"]