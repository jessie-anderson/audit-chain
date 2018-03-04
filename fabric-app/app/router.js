import { Router } from 'express'
import enrollAdmin from './enroll-admin'
import registerUser from './register-user'
import { recordUpdate, historyForRecord, getQueryCreator, filterQuery } from './api'

export const apiRouter = Router()
export const rootRouter = Router()

// TODO: signin

rootRouter.route('/enrolladmin')
  .post(enrollAdmin)

rootRouter.route('/registeruser')
  .post(registerUser)

apiRouter.route('/logs/:recordid')
  .post(recordUpdate)
  .get(historyForRecord)

apiRouter.route('/creator')
  .get(getQueryCreator)

apiRouter.route('/logs')
  .get(filterQuery)
