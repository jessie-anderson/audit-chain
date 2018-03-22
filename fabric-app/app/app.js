'use strict'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
// import expressJWT from 'express-jwt'
import auth from './lib/passport'
import apiRouter from './api-router'
import authRouter from './auth-router'
import adminRouter from './admin-router'
import enrollAdmin from './fabric-api/enroll-admin'
// import oAuthServer from './oauth-server'
dotenv.config()
enrollAdmin()

const app = express()

app.use(cors())

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// authentication
// auth(app)

// app.use('/api', expressJWT({ secret: 'mysecret' }))

app.use('/auth', authRouter)
app.use('/api', apiRouter)
app.use('/admin', adminRouter)
mongoose.connect(process.env.MONGO_URI)
// app.use('/auth', authRouter)

// app.use(oAuthServer.errorHandler())

app.listen(4001)
