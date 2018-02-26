#!/bin/bash

./byfn.sh -m down
docker rm $(docker ps -aq)
docker network prune
docker rmi dev-peer0.org2.example.com-encrypted-updates-1.0-6e3d363c908e7eb1237e96ee7d46269d9369fc9cfc792ffe04164bbd75281f4e
rm -rf ./crypto-config
./byfn.sh -m generate -f docker-compose-e2e.yaml
./byfn.sh -m up -f docker-compose-e2e.yaml
