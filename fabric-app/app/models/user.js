import mongoose, { Schema } from 'mongoose'
import passportLocalMongoose from 'passport-local-mongoose'

const UserSchema = new Schema({
  npi: { type: String },
  username: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true, enum: ['patient', 'doctor', 'admin'] },
  fabricEnrollmentId: { type: String, required: true },
})

UserSchema.plugin(passportLocalMongoose, { usernameField: 'username' })

export default mongoose.model('User', UserSchema)
