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
    hasChangedPassword: false,
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
  .then((u) => {
    u.hasChangedPassword = true
    return u.save()
  })
}

export function isUserAdmin(userId) {
  return User.findById(userId)
  .then((user) => {
    return Promise.resolve(user && user.role === 'admin')
  })
  .catch((error) => {
    return Promise.reject(error)
  })
}
