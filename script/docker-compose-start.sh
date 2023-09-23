#!/bin/bash

if [ -z "$1" ]; then
    echo "Enter profile (test | dev) !"
    exit 1
fi

cd docker
docker compose --profile $1 up
