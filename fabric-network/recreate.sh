#!/bin/bash

docker rm -f $(docker ps -aq)
docker network prune
docker rmi dev-peer0.org1.example.com-encrypted-updates-1.0-6e39615559278cde883ca5e8f7fbe6c195d7c6fa44a0113b64e4f3ec997befb4 dev-peer0.org2.example.com-encrypted-updates-1.0-6e3d363c908e7eb1237e96ee7d46269d9369fc9cfc792ffe04164bbd75281f4e
./byfn.sh -m generate
./byfn.sh -m up
rm -rf ../fabric-app/app/fabric-api/hfc-key-store
