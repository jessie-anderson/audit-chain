import bcrypt from 'bcrypt'
import sqlQuery from './sql-query'

function checkForUser(username) {
  sqlQuery(`SELECT * FROM users WHERE username=${username}`)
  .then((results) => {
    if (results.length > 0) return true
    else return false
  })
  .catch((err) => {
    return false
  })
}

function createUser(username, password) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err2, hash) => {
      sqlQuery('INSERT INTO users (username, passwordhash) VALUES (?, ?)', [username, hash])
      .then((results) => {
        return (null, null)
      })
      .catch((error) => { return error })
    })
  })
}

function getUserFromCredentials(username, password) {
  sqlQuery(`SELECT * FROM users WHERE username=${username}`)
  .then((results) => {
    if (results.length > 0) {
      return bcrypt.compare(password, results[0].passwordhash, (err, match) => {
        if (err || !match) return null
        else return results[0]
      })
    } else return null
  })
  .catch(() => { return null })
}

function saveToken(accessToken, userId) {

}

function getIDFromBearerToken(bearerToken) {

}

export default { checkForUser, createUser, getUserFromCredentials, saveToken, getIDFromBearerToken }
