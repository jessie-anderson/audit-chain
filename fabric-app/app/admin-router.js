import { Router } from 'express'
import registerUser from './fabric-api/register-user'
import { register } from './db-helper/api'

const adminRouter = Router()

adminRouter.route('/registeruser')
  .post(registerUser, register)

export default adminRouter
