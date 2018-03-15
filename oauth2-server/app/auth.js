import { checkForUser, createUser } from './db-helper'

export function register(req, res) {
  const { username, password } = req.body
  checkForUser(username)
  .then((userExists) => {
    if (userExists) {
      return res.error(`User ${username} already exists`)
    }
    return createUser(username, password)
  })
  .then(() => {
    return res.json(`Successfully registered user ${username}`)
  })
  .catch((err) => {
    return res.error(err)
  })
}

export function login(req, res) {
  const { username, password } = req.body
  checkForUser(username)
}
