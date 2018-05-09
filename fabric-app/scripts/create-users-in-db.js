const Promise = require('bluebird')
const mongoose = require('mongoose')
const User = require('../app/models/user')
const utils = require('./utils')

mongoose.connect('mongodb://localhost:27017/auditchain')

const roles = [
  'patient',
  'clinician',
  'admin',
]

const defaultPassword = 'p'

function createUser({ username, password, npi, firstName, lastName, role }) {
  // console.log('creating user')
  const newUser = new User({
    username,
    npi,
    firstName,
    lastName,
    role,
    fabricEnrollmentId: username,
    hasChangedPassword: false,
  })

  return User.register(newUser, password).then((user) => {
    return Promise.resolve(user)
  })
  .catch((err) => {
    return Promise.reject(err)
  })
}

const userPromises = []
for (let i = 0; i < 20; i += 1) {
  const user = {
    username: utils.makeString(),
    password: defaultPassword,
    npi: utils.getRandomIntBetween(1000000000, 10000000000), // 10 digit number
    firstName: utils.firstNames[utils.getRandomIntBetween(0, utils.firstNames.length)],
    lastName: utils.lastNames[utils.getRandomIntBetween(0, utils.lastNames.length)],
    role: roles[utils.getRandomIntBetween(0, 3)],
  }
  userPromises.push(createUser(user))
}

Promise.all(userPromises)
.then(() => {
  process.exit()
})
