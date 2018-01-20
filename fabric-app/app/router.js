import { Router } from 'express'
import enrollAdmin from './enrollAdmin'
import registerUser from './registerUser'

const router = Router()

router.route('/')
  .get((req, res) => {
    res.send('hi\n')
  })

router.route('/enroll/admin')
  .post(enrollAdmin)

router.route('/enroll/user')
  .post(registerUser)

export default router
