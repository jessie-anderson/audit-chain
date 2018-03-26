'use strict'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import passport from 'passport'
import LocalStrategy from 'passport-local'
import expressJWT from 'express-jwt'
import apiRouter from './api-router'
import authRouter from './auth-router'
import adminRouter from './admin-router'
import enrollAdmin from './fabric-api/enroll-admin'
import User from './models/user'
import { restrictToAdmins } from './db-helper/api'
import createDefaultAdmin from './db-helper/create-admin-user'

// configure environment variables
dotenv.config()

// enroll the boostrap fabric admin user, if needed
enrollAdmin()
createDefaultAdmin()

const app = express()

app.use(cors())

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// connect to mongo DB
mongoose.connect(process.env.MONGO_URI)

// passport authentication
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(passport.initialize())
app.use(passport.session())

// api routes protected by jwt
app.use('/api', expressJWT({ secret: process.env.JWT_SECRET }), apiRouter)

// other routes
app.use('/auth', authRouter)
app.use('/admin', expressJWT({ secret: process.env.JWT_SECRET }), restrictToAdmins, adminRouter)

app.listen(4001)
