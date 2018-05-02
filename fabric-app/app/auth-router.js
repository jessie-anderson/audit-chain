import { Router } from 'express'
import passport from 'passport'
import { enroll, login } from './db-helper/api'
import enrollUserIfNeeded from './fabric-api/enroll-user'

const authRouter = Router()

authRouter.route('/enroll')
  .post(enroll)

authRouter.route('/login')
  .post(passport.authenticate('local', { session: false }), enrollUserIfNeeded, login)

export default authRouter
