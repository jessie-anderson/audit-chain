import Promise from 'bluebird'
import User from '../models/user'

export function createUser({ username, password, npi, firstName, lastName, role }) {
  const newUser = new User({
    username,
    npi,
    firstName,
    lastName,
    role,
    fabricEnrollmentId: username,
    updatedPassword: false,
    updatedUsername: false,
  })

  return User.register(newUser, password).then((user) => {
    return Promise.resolve(user)
  })
  .catch((err) => {
    return Promise.reject(err)
  })
}

export function updateUsername({ user, newUsername }) {
  return User.findOneAndUpdate({
    _id: user._id,
  }, {
    username: newUsername,
  }, {
    new: true,
  })
  .then((newUser) => {
    return Promise.resolve(newUser)
  })
  .catch((err) => {
    return Promise.reject(err)
  })
}

export function updatePassword({ user, newPassword }) {
  return User.findById(user._id)
  .then((u) => {
    return u.setPassword(newPassword)
  })
  .catch((err) => {
    return Promise.reject(err)
  })
}
