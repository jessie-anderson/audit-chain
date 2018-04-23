# Audit Chain

## Prerequisites

### Docker
Install: https://docs.docker.com/install/

### Fabric docker images
Execute the command `curl -sSL https://goo.gl/6wtTN5 | bash -s 1.1.0` from any directory. (This will create a directory `fabric-samples` in the directory you run the command from - delete this directory, as you don't need it.)

### Go
Install: https://golang.org/dl/

### Node.js
Install: https://nodejs.org/en/download/

## Components

### Fabric REST Server
Node app with API endpoints that communicate with the network in `fabric-network`. Located in `fabric-app`. Endpoints invoking chaincode are protected by JWT tokens, which encode a user ID that chaincode queries and transactions are signed with.

**Startup instructions**

`cd fabric-app`

`npm install`

`npm run dev` to run in dev mode (restart on file change)

OR

`node app.js` to run without restarting on file changes


**Open endpoints:**

`POST /enrolladmin`: enrolls the admin user for the network (credentials sent in request body, `username` and `password`, correspond to bootstrap identity specified in definitions of certificate authorities in `fabric-network/docker-compose-e2e.yaml`).

`POST /registeruser`: registers and enrolls user specified by `username` and `password` parameters in request body. Utilizes bootstrap identity to register new user. Returns JWT token with encoded username.

**JWT-protected endpoints:**

`POST /api/logs/:recordid`: create audit log entry on-chain for medical record associated with `recordid`

`GET /api/logs/:recordid`: get all audit records for medical record associated with `recordid`

`GET /api/creator`: get identity information for user encoded in JWT

`GET /api/logs`: get all audit records for medical records matching query parameters `?userIds` and `?patientIds` (will add in `?startTime` and `?endTime` as well)

### Fabric Network
Contained in `fabric-network`. Based heavily on `first-network` from `hyperledger/fabric-samples` repo. To bring up the network, navigate to `fabric-network` and execute `./recreate.sh`. This starts the network from scratch, generating fresh cryptographic material for all network participants, removing any old identity information (deleting all users from the old network), and redeploying chaincode located in `chaincode/encrypted-updates`.

### Fabric Chaincode
Located in `chaincode`. `encrypted-updates.go` has smart contract logic for appending audit log records to the chain, getting the creator of a query, and getting transaction history.
