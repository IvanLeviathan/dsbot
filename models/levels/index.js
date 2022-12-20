import mongoose from 'mongoose'
const { Schema, model, Types } = mongoose

const schema = new Schema({
  guildId: { type: String, require: true },
  userId: { type: String, require: true },
  messagesCount: { type: Number, default: null },
})
const UserLevelModel = model('userlevel', schema)
export default UserLevelModel
