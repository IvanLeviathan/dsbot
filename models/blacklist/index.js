import mongoose from 'mongoose'
const { Schema, model, Types } = mongoose

const schema = new Schema({
  guildId: { type: String, require: false, default: null },
  userId: { type: String, require: false, default: null },
})
const BlackListModel = model('blacklist', schema)
export default BlackListModel
