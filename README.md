# Cludus Gateway (NodeJS)

Cludus Gateway implementation in [NodeJS](https://nodejs.org/).

![build](https://github.com/cludus/cludus-gateway-nodejs/actions/workflows/build.yml/badge.svg)

## Stack

This implementation uses [TypeScript](https://www.typescriptlang.org/)

## Development

### To install dependencies:

Login into github NPM registry with your github username and personal access token:
```bash
npm login --scope=@cludus --registry=https://npm.pkg.github.com
```

```bash
npm install
```

### To run:

```bash
npm run start:dev
```

### To test:

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
