import { Router } from 'express'
import {
  recordUpdate,
  historyForRecord,
  historyForUser,
  historyForPatient,
  allHistory
} from './fabric-api/api'
import { enroll } from './db-helper/api'

const apiRouter = Router()

apiRouter.route('/logs/:recordid/:patientid/:userid/:peerName')
.post(recordUpdate)

apiRouter.route('/logs/:start/:end/:peerName')
.get(allHistory)

apiRouter.route('/logs/:start/:end/:recordId/:peerName')
.get(historyForRecord)

apiRouter.route('/logs/:start/:end/:patientId/:peerName')
.get(historyForPatient)

apiRouter.route('/logs/:start/:end/:userId/:peerName')
.get(historyForUser)

apiRouter.route('/enroll')
.post(enroll)

export default apiRouter
