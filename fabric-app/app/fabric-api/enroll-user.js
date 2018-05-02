import FabricClient from 'fabric-client'
import FabricCAClient from 'fabric-ca-client'
import path from 'path'

export default function enrollUserIfNeeded(req, res, next) {
  if (req.user.hasChangedPassword) {
    next()
  } else {
    enrollUser(req, res, next)
  }
}

function enrollUser(req, res, next) {
  const fabricClient = new FabricClient()
  let fabricCAClient = null
  const storePath = path.join(__dirname, 'hfc-key-store')
  console.log(` Store path:${storePath}`)
  FabricClient.newDefaultKeyValueStore({ path: storePath,
  })
  .then((stateStore) => {
      // assign the store to the fabric client
    fabricClient.setStateStore(stateStore)
    const cryptoSuite = FabricClient.newCryptoSuite()
      // use the same location for the state store (where the users' certificate are kept)
      // and the crypto store (where the users' keys are kept)
    const cryptoStore = FabricClient.newCryptoKeyStore({ path: storePath })
    cryptoSuite.setCryptoKeyStore(cryptoStore)
    fabricClient.setCryptoSuite(cryptoSuite)
      // be sure to change the http to https when the CA is running TLS enabled
    fabricCAClient = new FabricCAClient('https://localhost:7054', null, '', cryptoSuite)
    return fabricCAClient.enroll({
      enrollmentID: req.body.username,
      enrollmentSecret: req.body.password,
    })
  })
  .then((enrollment) => {
    console.log('enrollment:')
    console.log(enrollment)
    return fabricClient.createUser(
      { username: req.body.username,
        mspid: 'Org1MSP',
        cryptoContent: {
          privateKeyPEM: enrollment.key.toBytes(),
          signedCertPEM: enrollment.certificate,
        },
      })
  })
  .then(() => {
    next()
  })
  .catch((err) => {
    console.log(`fabric error: ${err}`)
    req.enrollError = err
    next()
  })
}
