import FabricClient from 'fabric-client'
import path from 'path'

export default function query(request, fn) {
  const fabricClient = new FabricClient()
  const channel = fabricClient.newChannel('mychannel')
  const peer = fabricClient.newPeer('grpc://localhost:7051')
  const keyStorePath = path.join(__dirname, 'hfc-key-store')
  channel.addPeer(peer)

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
    return channel.queryByChaincode(request)
  })
  .then((result) => {
    console.log('Response: ', result[0].toString())
    fn(null, result)
  })
  .catch((error) => {
    console.log('Error: ', error)
    fn(error)
  })
}
