import { Router } from 'express'
import enrollAdmin from './enroll-admin'
import registerUser from './register-user'
import getAllLogs from './queries/all-logs'
import createLog from './queries/create-log'
import getLogById from './queries/log-by-id'

const router = Router()

router.route('/')
  .get((req, res) => {
    res.send('hi\n')
  })

router.route('/enroll/admin')
  .post(enrollAdmin)

router.route('/enroll/user')
  .post(registerUser)

router.route('/logs')
  .get(getAllLogs)
  .post(createLog)

router.route('/logs/:logid')
  .get(getLogById)

export default router
