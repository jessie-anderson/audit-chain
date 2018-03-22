import { updateUsername, updatePassword, createUser } from './user'

export function register(req, res) {
  if (req.registerError) {
    res.status(500).send(req.registerError)
  }

  createUser({
    username: req.body.username,
    password: req.enrollmentSecret,
    npi: req.body.npi,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
  })
  .then((user) => {
    res.json(user)
  })
  .catch((err) => {
    res.status(500).send(err)
  })
}

export function enroll(req, res) {
  if (req.enrollError) {
    res.status(500).send(req.enrollError)
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
  .then((r) => {
    res.json(r)
  })
  .catch((err) => {
    console.log(err)
    res.status(500).send(err)
  })
}
