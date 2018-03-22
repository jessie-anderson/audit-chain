import FabricClient from 'fabric-client'
import path from 'path'
import fs from 'fs'
import networkConfig from './network-config.json'

export default function transaction(request, username, peerName, fn) {
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
  const keyStorePath = path.join(__dirname, 'hfc-key-store')
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
