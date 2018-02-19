import { Router } from 'express'
import enrollAdmin from './enroll-admin'
import registerUser from './register-user'
import { recordUpdate, historyForRecord } from './api'
// import getAllLogs from './queries/all-logs'
// import createLog from './queries/create-log'
// import getLogById from './queries/log-by-id'
// import getCreator from './queries/get-creator'
// import { createAsset, getAsset } from './queries/simple-asset'

const router = Router()

router.route('/')
  .get((req, res) => {
    res.send('hi\n')
  })

router.route('/enroll/admin')
  .post(enrollAdmin)

router.route('/enroll/user')
  .post(registerUser)

router.route('/logs/:recordid')
  .post(recordUpdate)
  .get(historyForRecord)

// router.route('/logs')
//   .get(getAllLogs)
//   .post(createLog)
//
// router.route('/logs/:logid')
//   .get(getLogById)
//
// router.route('/creator')
//   .get(getCreator)
//
// router.route('/query/simple1/:key')
//   .get(getAsset)
//
// router.route('/transact/simple1')
//   .post(createAsset)

export default router
