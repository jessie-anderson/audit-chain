import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import authRouter from './router'

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded(true))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('hi')
})
app.use('/auth', authRouter)

app.listen(5001)
