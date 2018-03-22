import { createUser } from './user'

export function register(req, res) {
  console.log(req.enrollmentSecret)
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
  console.log(req.enrollError)
  res.json('success')
}
