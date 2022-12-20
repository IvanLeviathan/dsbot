import mongoose from 'mongoose'
const { Schema, model, Types } = mongoose

const schema = new Schema({
  guildId: { type: String, require: true, unique: true },
  logs: { type: Object, require: false, default: [] },
})
const ServerLogsModel = model('serverlog', schema)
export default ServerLogsModel
