import FabricClient from 'fabric-client'
import path from 'path'

export default function transaction(request, fn) {
  const fabricClient = new FabricClient()
  const channel = fabricClient.newChannel('mychannel')
  const peer = fabricClient.newPeer('grpc://localhost:7051')
  const order = fabricClient.newOrderer('grpc://localhost:7050')
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
    return fabricClient.getUserContext('user1', true)
  })
  .then((user) => {
    if (!user || !user.isEnrolled()) {
      throw new Error('Failed to get user 1')
    }
    txId = fabricClient.newTransactionID()
    console.log('Assigning new transaction ID: ', txId)
    request.txId = txId
    request.chainId = 'mychannel'
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

      const eventHub = fabricClient.newEventHub()
      eventHub.setPeerAddr('grpc://localhost:7053')

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
