import User from '../models/user'

export default function createDefaultAdmin() {
  User.find({ role: 'admin' })
  .then((users) => {
    if (!users || users.length < 1) {
      const user = {
        username: process.env.ADMIN_USERNAME,
        role: 'admin',
        firstName: 'adminFirst',
        lastName: 'adminLast',
        fabricEnrollmentId: 'admin',
      }

      User.register(user, process.env.ADMIN_PASSWORD)
    }
  })
  .catch((err) => {
    console.log(err)
  })
}
