import mongoose from 'mongoose'
const { Schema, model, Types } = mongoose

const schema = new Schema({
  guildId: { type: String, require: true, unique: true },
  stats: { type: Object, require: false, default: {} },
})
const ServerStatsModel = model('serverstats', schema)
export default ServerStatsModel
