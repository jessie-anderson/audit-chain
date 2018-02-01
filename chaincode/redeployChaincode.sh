#!/bin/bash

docker rm -f $(docker ps -aq)
docker network prune
docker rmi dev-peer0.org1.example.com-audit-chaincode-1.0-70f02a63824f09861f9780192b71164fbcc90f28fd1969beec42912f5f6c149c

cd audit-chaincode
go build -i audit-chaincode.go

cd ../../fabric-app/app
rm -rf hfc-key-store/

./startFabric.sh
