const FabricClient = require('fabric-client')
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const networkConfig = require('../app/fabric-api/network-config.json')
const utils = require('./utils')
const User = require('../app/models/user')

mongoose.connect('mongodb://localhost:27017/auditchain')

const actionTypes = [
  'create',
  'edit',
  'delete',
  'view',
]

const dataTypes = [
  'record',
  'diagnosis',
  'prescription',
  'lab result',
]

const entryMethods = [
  'copy and paste',
  'macro',
  'import',
  'template',
  'copy forward',
]

const fields = [
  'recordId',
  'patientId',
  'userId',
  'actionType',
  'dataType',
  'originalAuthorId',
  'dataField',
  'data',
  'entryMethod',
  'userNpi',
  'originalAuthorNpi',
  'organizationNpi',
]

const requests = []

const patientsPromise = User.find({ role: 'patient' }).exec()
const usersPromise = User.find({ $or: [{ role: 'clinician' }, { role: 'admin' }] }).exec()

Promise.all([patientsPromise, usersPromise])
.then(([patients, users]) => {
  const patientRecordMapping = {}
  patients.forEach((p) => {
    if (!patientRecordMapping[p._id]) {
      patientRecordMapping[p._id] = []
    }
    patientRecordMapping[p._id].push(utils.makeString())
    patientRecordMapping[p._id].push(utils.makeString())
  })
  for (let i = 0; i < 200; i += 1) {
    const user = users[utils.getRandomIntBetween(0, users.length)]
    const patient = patients[utils.getRandomIntBetween(0, patients.length)]
    const recordIds = patientRecordMapping[patient._id]
    const args = fields.map((f) => {
      let val
      switch (f) {
        default:
          val = ''
          break
        case 'recordId':
          val = recordIds[utils.getRandomIntBetween(0, recordIds.length)]
          break
        case 'dataField':
        case 'data':
          val = utils.makeString()
          break
        case 'dataType':
          val = dataTypes[utils.getRandomIntBetween(0, dataTypes.length)]
          break
        case 'patientId':
          val = patient._id
          break
        case 'userId':
          val = user._id
          break
        case 'actionType':
          val = actionTypes[utils.getRandomIntBetween(0, actionTypes.length)]
          break
        case 'entryMethod':
          val = entryMethods[utils.getRandomIntBetween(0, entryMethods.length)]
          break
        case 'userNpi':
          val = user.npi
          break
        case 'originalAuthorNpi':
          val = users[utils.getRandomIntBetween(0, users.length)].npi
          break
        case 'organizationNpi':
          val = utils.getRandomIntBetween(1000000000, 10000000000)
      }
      return `${f}:${val}`
    })
    args.push(`time:${Date.now()}`)
    requests.push({
      chaincodeId: 'encrypted-updates',
      fcn: 'recordUpdate',
      args,
    })
  }
  console.log(requests)
  doTransactionRecurse(0)
})

function doTransactionRecurse(i) {
  if (i < requests.length) {
    transaction(requests[i], 'admin', 'peer2', () => {
      doTransactionRecurse(i + 1)
    })
  } else {
    console.log('done')
    process.exit()
  }
}

function transaction(request, username, peerName, fn) {
  const fabricClient = new FabricClient()
  const channel = fabricClient.newChannel('mychannel')
  const peerConfig = networkConfig[peerName]
  const peerPem = fs.readFileSync(peerConfig.pemFilePath)
  const peer = fabricClient.newPeer(`grpcs://localhost:${peerConfig.port}`, {
    pem: Buffer.from(peerPem).toString(),
    'ssl-target-name-override': peerConfig.containerName,
  })
  const orderPem = fs.readFileSync('/Users/Jessie/audit-chain/fabric-network/crypto-config/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem')
  const order = fabricClient.newOrderer('grpcs://localhost:7050', {
    pem: Buffer.from(orderPem).toString(),
    'ssl-target-name-override': 'orderer.example.com',
  })
  const keyStorePath = path.join(__dirname, '../app/fabric-api/hfc-key-store')
  let txId
  channel.addPeer(peer)
  channel.addOrderer(order)

  FabricClient.newDefaultKeyValueStore({ path: keyStorePath })
  .then((stateStore) => {
    fabricClient.setStateStore(stateStore)
    const cryptoSuite = FabricClient.newCryptoSuite()
    const cryptoStore = FabricClient.newCryptoKeyStore({ path: keyStorePath })
    cryptoSuite.setCryptoKeyStore(cryptoStore)
    fabricClient.setCryptoSuite(cryptoSuite)
    return fabricClient.getUserContext(username, true)
  })
  .then((user) => {
    if (!user || !user.isEnrolled()) {
      throw new Error(`Failed to get ${username}`)
    }
    return user.getCryptoSuite().generateKey({ ephemeral: true, private: false })
  })
  .then((k) => {
    txId = fabricClient.newTransactionID()
    console.log('Assigning new transaction ID: ', txId)
    request.txId = txId
    request.chainId = 'mychannel'
    // console.log(request)
    return channel.sendTransactionProposal(request)
  })
  .then((result) => {
    console.log(result[0])
    console.log(result[1])
    const proposalResponses = result[0]
    const proposal = result[1]
    const proposalIsGood = proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200
    console.log(`${proposalIsGood ? 'proposal good' : 'proposal bad'}`)

    if (proposalIsGood) {
      const txIdString = txId.getTransactionID()
      const txRequest = {
        proposalResponses,
        proposal,
        orderer: null,
      }

      const promises = []
      const sendPromise = channel.sendTransaction(txRequest)
      promises.push(sendPromise)

      const hubPem = fs.readFileSync('/Users/Jessie/audit-chain/fabric-network/crypto-config/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem')
      const eventHub = fabricClient.newEventHub()
      eventHub.setPeerAddr('grpcs://localhost:7053', {
        pem: Buffer.from(hubPem).toString(),
        'ssl-target-name-override': 'peer0.org1.example.com',
      })

      const txPromise = new Promise((resolve, reject) => {
        const handle = setTimeout(() => {
          eventHub.disconnect()
          reject(new Error('Transaction did not complete within 10 seconds'))
        }, 10000)

        eventHub.connect()
        eventHub.registerTxEvent(txIdString, (tx, code) => {
          clearTimeout(handle)
          eventHub.unregisterTxEvent(txIdString)
          eventHub.disconnect()
          const returnStatus = { eventStatus: code, txId: txIdString }

          if (code !== 'VALID') {
            reject('The transaction was invalid, code = ', code)
          } else {
            console.log('The transaction has been committed on peer ', eventHub._ep._endpoint.addr)
            resolve(returnStatus)
          }
        }, (err) => {
          reject('There was a problem with the event hub: ', err)
        })
      })

      promises.push(txPromise)
      console.log('promises', promises)
      return Promise.all(promises)
    } else {
      throw new Error('Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...')
    }
  })
  .then((results) => {
    console.log('Send transaction promise and event listener promise have completed')
    // check the results in the order the promises were added to the promise all list
    console.log(results)
    if (results && results[0] && results[0].status === 'SUCCESS') {
      console.log('Successfully sent transaction to the orderer.')
    } else {
      throw new Error('Failed to order the transaction. Error code: ', results[0].status)
    }

    if (results && results[1] && results[1].eventStatus === 'VALID') {
      console.log('Successfully committed the change to the ledger by the peer')
      fn(null, { status: 200 })
    } else {
      console.log('Transaction failed to be committed to the ledger due to :', results[1].eventStatus)
      fn(new Error('Transaction failed to be committed to the ledger due to: ', results[1].eventStatus))
    }
  })
  .catch((error) => {
    console.log('Error: ', error)
    fn(error)
  })
}
