import mongoose from 'mongoose'
const { Schema, model, Types } = mongoose

const schema = new Schema({
  guildId: { type: String, require: true },
  userId: { type: String, require: true },
  minutes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})
const UserMuteModel = model('usermute', schema)
export default UserMuteModel
