'use strict'

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import router from './router'

const app = express()

app.use(cors())

// enable json message body for posting data to API
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/api', router)

app.listen(4001)
