import { Router } from 'express'
import { enroll } from './db-helper/api'
import enrollUser from './fabric-api/enroll-user'

const authRouter = Router()

authRouter.route('/enroll')
  .post(enrollUser, enroll)

authRouter.route('/login')

authRouter.route('/logout')

export default authRouter
