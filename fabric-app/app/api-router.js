import { Router } from 'express'
import {
  recordUpdate,
  historyForRecord,
  historyForUser,
  historyForPatient,
  allHistory,
} from './fabric-api/api'
import { enroll } from './db-helper/api'

const apiRouter = Router()

apiRouter.route('/logs/:recordid/:patientid/:userid/:peerName')
.post(recordUpdate)

apiRouter.route('/logs/all/:peerName')
.get(allHistory)

apiRouter.route('/logs/record/:peerName')
.get(historyForRecord)

apiRouter.route('/logs/patient/:peerName')
.get(historyForPatient)

apiRouter.route('/logs/user/:peerName')
.get(historyForUser)

apiRouter.route('/enroll')
.post(enroll)

export default apiRouter
