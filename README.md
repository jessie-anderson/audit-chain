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

## Startup instructions

1. Clone repository

  `git clone https://github.com/jessie-anderson/audit-chain.git`

1. Hyperledger Fabric Network

    `cd /audit-chain/fabric-network`

    `./recreate.sh`

    The script should execute without errors.

2. Start Mongo

  `mongod`

3. NodeJS server (client to Fabric chaincode)

  `cd audit-chain/fabric-app`

  `npm install`

  `npm run dev` to run in dev mode (restarts on file changes)

  OR

  `node app.js` to run without restarting on file changes

  This step enrolls the bootstrap admin user on the Fabric network.

4. Create users in the database (this only makes usernames/passwords, but does not register users on Fabric network)

  `cd audit-chain/fabric-app/scripts`

  `node create-users-in-db.js`

5. Create fake audit logs on the blockchain

  `cd audit-chain/fabric-app/scripts`

  `node post-logs.js`

6. Start the desktop application

  `cd audit-chain/desktop-app`

  `npm install`

  `npm start`
