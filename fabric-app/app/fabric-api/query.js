import FabricClient from 'fabric-client'
import path from 'path'
import fs from 'fs'
import networkConfig from './network-config.json'

export default function query(request, username, peerName, fn) {
  const fabricClient = new FabricClient()
  const channel = fabricClient.newChannel('mychannel')
  const peerConfig = networkConfig[peerName]
  const peerPem = fs.readFileSync(peerConfig.pemFilePath)
  const peer = fabricClient.newPeer(`grpcs://localhost:${peerConfig.port}`, {
    pem: Buffer.from(peerPem).toString(),
    'ssl-target-name-override': peerConfig.containerName,
  })
  const keyStorePath = path.join(__dirname, 'hfc-key-store')
  channel.addPeer(peer)

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
    return channel.queryByChaincode(request)
  })
  .then((result) => {
    fn(null, result[0].toString())
  })
  .catch((error) => {
    console.log('Error: ', error)
    fn(error)
  })
}
