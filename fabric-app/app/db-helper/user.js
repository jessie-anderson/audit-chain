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
  })

  return User.register(newUser, password).then((user) => {
    return Promise.resolve(user)
  })
  .catch((err) => {
    return Promise.reject(err)
  })
}

export function updateUsername({ fabricEnrollmentId, newUsername }) {
  return User.findOneAndUpdate({
    fabricEnrollmentId,
  }, {
    username: newUsername,
  }, {
    new: true,
  })
}

export function updatePassword({ user, newPassword }) {
  return User.findById(user._id)
  .then((u) => {
    return u.setPassword(newPassword)
  })
  .then((r) => {
    console.log(r)
    return Promise.resolve()
  })
  .catch((err) => {
    console.log(err)
    return Promise.reject(err)
  })
}
