import { Router } from 'express'
import registerUser from './fabric-api/register-user'
import { recordUpdate, historyForRecord, filterQuery } from './fabric-api/api'

export const apiRouter = Router()
export const rootRouter = Router()

// TODO: signin

rootRouter.route('/registeruser')
  .post(registerUser)

apiRouter.route('/logs/:recordid/:peerName')
  .post(recordUpdate)
  .get(historyForRecord)

apiRouter.route('/logs/:peerName')
  .get(filterQuery)
