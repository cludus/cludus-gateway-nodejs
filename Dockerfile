FROM oven/bun

WORKDIR /usr/src/app

COPY . .
RUN bun install
RUN bun build --outdir ./build --target bun --splitting ./src/index.ts
RUN rm -rf ./src

ENV NODE_ENV production
ENV PORT 8080

EXPOSE 8080
CMD [ "bun", "start:build" ]
