# Cludus Gateway (NodeJS)

Cludus Gateway implementation in [NodeJS](https://nodejs.org/).

## Stack

This implementation uses [TypeScript](https://www.typescriptlang.org/)

## Development

To install dependencies:

```bash
npm install
```

To run:

```bash
npm run start:dev
```

To test:

```bash
npm test
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
