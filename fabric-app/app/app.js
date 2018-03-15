'use strict'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
// import expressJWT from 'express-jwt'
import { apiRouter, rootRouter } from './router'
// import oAuthServer from './oauth-server'

const app = express()

app.use(cors())

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
// app.use('/api', expressJWT({ secret: 'mysecret' }))

app.use('/', rootRouter)
app.use('/api', apiRouter)
// app.use('/auth', authRouter)

// app.use(oAuthServer.errorHandler())

app.listen(4001)
