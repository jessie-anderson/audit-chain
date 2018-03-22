/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Enroll the admin user
 */

import FabricClient from 'fabric-client'
import FabricCAClient from 'fabric-ca-client'
import path from 'path'

export default function enrollAdmin() {
  const fabricClient = new FabricClient()
  let fabricCAClient = null
  let adminUser = null
  const storePath = path.join(__dirname, 'hfc-key-store')
  console.log(` Store path:${storePath}`)

  // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
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
    const tlsOptions = {
      trustedRoots: [],
      verify: false,
    }
      // be sure to change the http to https when the CA is running TLS enabled
    fabricCAClient = new FabricCAClient('https://localhost:7054', tlsOptions, 'ca-org1', cryptoSuite)

      // first check to see if the admin is already enrolled
    return fabricClient.getUserContext(process.env.ADMIN_USERNAME, true)
  })
  .then((userFromStore) => {
    if (userFromStore && userFromStore.isEnrolled()) {
      console.log('Successfully loaded admin from persistence')
      adminUser = userFromStore
      return null
    } else {
          // need to enroll it with CA server
      return fabricCAClient.enroll({
        enrollmentID: process.env.ADMIN_USERNAME,
        enrollmentSecret: process.env.ADMIN_PASSWORD,
      })
      .then((enrollment) => {
        console.log(enrollment.certificate)
        console.log('Successfully enrolled admin user "admin"')
        return fabricClient.createUser(
          { username: process.env.ADMIN_USERNAME,
            mspid: 'Org1MSP',
            cryptoContent: {
              privateKeyPEM: enrollment.key.toBytes(),
              signedCertPEM: enrollment.certificate,
            },
          })
      })
      .then((user) => {
        adminUser = user
        return fabricClient.setUserContext(adminUser)
      })
      .catch((err) => {
        console.error(`Failed to enroll and persist admin. Error: ${err.stack}` ? err.stack : err)
        throw new Error('Failed to enroll admin')
      })
    }
  })
  .then(() => {
    console.log(`Assigned the admin user to the fabric client ::${adminUser.toString()}`)
  })
  .catch((err) => {
    console.error(`Failed to enroll admin: ${err}`)
  })
}
