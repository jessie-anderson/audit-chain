import { Router } from 'express'
import { recordUpdate, historyForRecord, getQueryCreator, filterQuery } from './fabric-api/api'

const apiRouter = Router()

apiRouter.route('/logs/:recordid/:peerName')
.post(recordUpdate)
.get(historyForRecord)

apiRouter.route('/creator/:peerName')
.get(getQueryCreator)

apiRouter.route('/logs/:peerName')
.get(filterQuery)

export default apiRouter
