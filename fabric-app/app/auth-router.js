import { Router } from 'express'
import passport from 'passport'
import { enroll, login } from './db-helper/api'
import enrollUser from './fabric-api/enroll-user'

const authRouter = Router()

authRouter.route('/enroll')
  .post(enrollUser, enroll)

authRouter.route('/login')
  .post(passport.authenticate('local', { session: false }), login)

export default authRouter
