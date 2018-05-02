import moment from 'moment'
import jwt from 'jsonwebtoken'
import { updateUsername, updatePassword, createUser, isUserAdmin } from './user'

export function register(req, res) {
  if (req.registerError) {
    res.status(500).send(req.registerError)
  } else {
    createUser({
      username: req.body.username,
      password: req.enrollmentSecret,
      npi: req.body.npi,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role: req.body.role,
    })
    .then((user) => {
      res.json({
        username: req.body.username,
        tempPassword: req.enrollmentSecret,
      })
    })
    .catch((err) => {
      res.status(500).send(err)
    })
  }
}

export function enroll(req, res) {
  console.log(req.headers)
  if (req.enrollError) {
    res.status(500).send(req.enrollError)
    return
  }
  updateUsername({
    fabricEnrollmentId: req.body.fabricEnrollmentId,
    newUsername: req.body.username,
  })
  .then((user) => {
    return updatePassword({
      user,
      newPassword: req.body.password,
    })
  })
  .then((updatedUser) => {
    const expires = moment().add(1, 'days').valueOf()
    const token = jwt.sign({
      username: updatedUser.username,
      fabricEnrollmentId: updatedUser.fabricEnrollmentId,
      _id: updatedUser._id,
      exp: expires,
    }, process.env.JWT_SECRET)
    res.json({ user: updatedUser, token })
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send(err)
  })
}

export function login(req, res) {
  delete req.user.salt
  delete req.user.hash
  console.log(req.user)
  const user = {
    _id: req.user._id,
    username: req.user.username,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    role: req.user.role,
    hasChangedPassword: req.user.hasChangedPassword,
  }
  const expires = moment().add(1, 'days').valueOf()
  const token = jwt.sign({
    username: req.user.username,
    fabricEnrollmentId: req.user.fabricEnrollmentId,
    _id: req.user._id,
    exp: expires,
  }, process.env.JWT_SECRET)
  res.json({ user, token })
}

export function restrictToAdmins(req, res, next) {
  isUserAdmin(req.user._id)
  .then((isAdmin) => {
    if (isAdmin) {
      next()
    } else {
      res.status(401).send('Unauthorized')
    }
  })
  .catch((err) => {
    res.status(500).send(err)
  })
}
