FROM oven/bun

WORKDIR /usr/src/app

COPY . .
RUN bun install
RUN bun build --outdir ./build --target bun --splitting ./src/index.ts

ENV NODE_ENV production
ENV PORT 8080
ENV WS_PATH "/websocket"

EXPOSE 8080
CMD [ "bun", "start:build" ]
