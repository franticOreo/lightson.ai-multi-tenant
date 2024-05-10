FROM node:18.18-alpine as base

RUN curl -I http://ayresconstruction.lightson.ai

ARG PAYLOAD_SECRET
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET

# Install necessary packages
RUN apk add --no-cache curl bash

# Install Vector
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.vector.dev | sh -s -- -y

# Create a directory for Vector configuration
RUN mkdir -p /etc/vector

# Add the Vector configuration file
ADD vector.yaml /etc/vector/vector.yaml

# Expose the port Vector uses (adjust if different)
EXPOSE 8383

# Command to run Vector
CMD ["/usr/bin/vector", "-c", "/etc/vector/vector.yaml"]


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