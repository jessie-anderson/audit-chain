import { Router } from 'express'
import enrollAdmin from './enroll-admin'
import registerUser from './register-user'
import { recordUpdate, historyForRecord, getQueryCreator } from './api'
// import getAllLogs from './queries/all-logs'
// import createLog from './queries/create-log'
// import getLogById from './queries/log-by-id'
// import getCreator from './queries/get-creator'
// import { createAsset, getAsset } from './queries/simple-asset'

export const apiRouter = Router()
export const rootRouter = Router()

// router.route('/signin')
//   .post(signin)

rootRouter.route('/enrolladmin')
  .post(enrollAdmin)

rootRouter.route('/registeruser')
  .post(registerUser)

apiRouter.route('/logs/:recordid')
  .post(recordUpdate)
  .get(historyForRecord)

apiRouter.route('/creator')
  .get(getQueryCreator)

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
