/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
*/
/*
 * Register and Enroll a user
 */

import FabricClient from 'fabric-client'
import FabricCAClient from 'fabric-ca-client'
import path from 'path'

export default function registerUser(req, res, next) {
  //
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
      // be sure to change the http to https when the CA is running TLS enabled
    fabricCAClient = new FabricCAClient('https://localhost:7054', null, '', cryptoSuite)

      // first check to see if the admin is already enrolled
    return fabricClient.getUserContext(process.env.ADMIN_USERNAME, true)
  })
  .then((userFromStore) => {
    if (userFromStore && userFromStore.isEnrolled()) {
      console.log('Successfully loaded admin from persistence')
      adminUser = userFromStore
    } else {
      throw new Error('Failed to get admin.... run enrollAdmin.js')
    }

      // at this point we should have the admin user
      // first need to register the user with the CA server
    console.log(req.body)
    return fabricCAClient.register({
      enrollmentID: req.body.username,
      affiliation: 'org1.department1',
      role: 'user',
    }, adminUser)
  })
  .then((enrollmentSecret) => {
      // next we need to enroll the user with CA server
    console.log(`Successfully registered ${req.body.username} - secret:${enrollmentSecret}`)
    req.enrollmentSecret = enrollmentSecret
    next()
  })
  .catch((err) => {
    console.error(`Failed to register: ${err}`)
    if (err.toString().indexOf('Authorization') > -1) {
      console.error(`${'Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
      'Try again after deleting the contents of the store directory '}${storePath}`)
    }
    req.registerError = err
    next()
  })
}
