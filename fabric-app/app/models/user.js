const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
  npi: { type: String },
  username: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true, enum: ['patient', 'clinician', 'admin'] },
  fabricEnrollmentId: { type: String, required: true },
  hasChangedPassword: { type: Boolean, required: true, default: false },
})

UserSchema.plugin(passportLocalMongoose, { usernameField: 'username' })

module.exports = mongoose.model('User', UserSchema)
