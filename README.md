# Cludus Gateway (NodeJS)

Cludus Gateway implementation in node.

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

To test:

```bash
bun test
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
    image: ghcr.io/cludus/gateway-nodejs:latest
    environment:
      NODE_ENV: "production" # or "live". Use any other value for development purposes (debug level logs).
      WS_PATH: "/websocket"
      METRICS_PATH: "/actuator/prometheus"
    ports:
      - "8080:8080"
```
