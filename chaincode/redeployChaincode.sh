#!/bin/bash

docker rm -f $(docker ps -aq)
docker network prune
docker rmi dev-peer0.org1.example.com-encrypted-updates-1.0-6e39615559278cde883ca5e8f7fbe6c195d7c6fa44a0113b64e4f3ec997befb4
docker rmi dev-peer0.org1.example.com-simple-cc-1-1.0-612f5a83f73d9a8abe62abea048c9336ff5661207542214933bb7e4ef967c6c0
docker rmi dev-peer0.org1.example.com-encrypted-updates-1.0-6e39615559278cde883ca5e8f7fbe6c195d7c6fa44a0113b64e4f3ec997befb4
cd ../fabric-app/app
rm -rf hfc-key-store/

./startFabric.sh
