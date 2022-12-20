import mongoose from 'mongoose'
const { Schema, model, Types } = mongoose

const schema = new Schema({
  guildId: { type: String, require: true, unique: false },
  userId: { type: String, require: true, unique: false },
  text: { type: String, default: '' },
  image: { type: String, default: '' },
})
const UserInfoModel = model('userinfo', schema)
export default UserInfoModel
