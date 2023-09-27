FROM oven/bun

WORKDIR /usr/src/app

COPY . .
RUN bun install

ENV PORT 8080

EXPOSE 8080
CMD [ "bun", "start" ]
