#!/bin/bash

docker build -t ghcr.io/cludus/gateway-nodejs:latest .
docker push ghcr.io/cludus/gateway-nodejs:latest
