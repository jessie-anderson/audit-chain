import oAuth2Server from 'oauth2-server'
import Promise from 'bluebird'
import { getUserFromCredentials, saveToken, getIDFromBearerToken } from './db-helper'

function getClient(clientID, clientSecret, callback) {
  const client = {
    clientID,
    clientSecret,
    grants: null,
    redirectUris: null,
  }

  callback(false, client)
}

function grantTypeAllowed(clientId, grantType, callback) {
  callback(false, true)
}

function getUser(username, password, callback) {
  getUserFromCredentials(username, password)
  .then((user) => { callback(null, user) })
  .catch((err) => { callback(err, null) })
}

function saveAccessToken(accessToken, clientId, expires, user, callback) {
  saveToken(accessToken, user.id)
  .then(() => { callback(null) })
  .catch((err) => { callback(err) })
}

function getAccessToken(bearerToken, callback) {
  getIDFromBearerToken(bearerToken)
  .then((id) => {
    return Promise.resolve({
      user: {
        id,
      },
      expires: null,
    })
  })
  .then((accessToken) => { callback(null, accessToken) })
  .catch((err) => { callback(err, null) })
}

const model = {
  getClient,
  grantTypeAllowed,
  getUser,
  saveAccessToken,
  getAccessToken,
}

const oAuthServer = oAuth2Server({
  model,
  grants: ['password'],
  debug: true,
})

export default oAuthServer
