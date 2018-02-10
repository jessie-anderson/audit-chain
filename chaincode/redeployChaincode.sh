#!/bin/bash

docker rm -f $(docker ps -aq)
docker network prune
docker rmi dev-peer0.org1.example.com-encrypted-updates-1.0-6e39615559278cde883ca5e8f7fbe6c195d7c6fa44a0113b64e4f3ec997befb4
cd ../fabric-app/app
rm -rf hfc-key-store/

./startFabric.sh
