import { Router } from 'express'
import { recordUpdate, historyForRecord, getQueryCreator, filterQuery } from './fabric-api/api'
import { enroll } from './db-helper/api'

const apiRouter = Router()

apiRouter.route('/logs/:recordid/:patientid/:userid/:peerName')
.post(recordUpdate)
.get(historyForRecord)

apiRouter.route('/creator/:peerName')
.get(getQueryCreator)

apiRouter.route('/logs/:peerName')
.get(filterQuery)

apiRouter.route('/enroll')
.post(enroll)

export default apiRouter
