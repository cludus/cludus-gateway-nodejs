# Cludus Gateway (NodeJS)

Cludus Gateway implementation in node

## Stack

This implementation uses [Bun](https://bun.sh), [TypeScript](https://www.typescriptlang.org/)

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start:dev
```

## Deployment

The docker image can be deployed using:

```bash
docker run ghcr.io/cludus/gateway-nodejs
```

For docker compose use the following script:

```bash
services:
  gateway-nodejs:
    image: ghcr.io/cludus/gateway-nodejs
    environment:
      WS_PATH: "/websocket"
    ports:
      - "8080:8080"
```
