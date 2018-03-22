import passport from 'passport'
import LocalStrategy from 'passport-local'
// import jwt from 'jsonwebtoken'
// import moment from 'moment'
import User from '../models/user'

export default function auth(app) {
  passport.use(new LocalStrategy(User.authenticate()))
  passport.serializeUser(User.serializeUser())
  passport.deserializeUser(User.deserializeUser())

  app.use(passport.initialize())
  app.use(passport.session())
  app.post('/login', passport.authenticate('local'), login)
}

function login(req, res) {
  console.log(req)
  res.send({ status: 200 })
}
