import mongoose from 'mongoose'
const { Schema, model, Types } = mongoose

const schema = new Schema({
  userId: { type: String, require: true, unique: true },
  money: { type: Number, default: null },
  lastEarn: { type: Date, default: null },
})
const UserDataModel = model('userdata', schema)
export default UserDataModel
