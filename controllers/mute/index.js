import UserMuteModel from '../../models/mute/index.js'
import { updateMutedUsers } from '../../modules/bot/mute.js'

export async function muteUser(guildId, userId, minutes) {
  const newUserMute = new UserMuteModel({
    guildId,
    userId,
    minutes,
    createdAt: new Date(),
  })
  const resp = await newUserMute.save()
  updateMutedUsers()
  if (!!resp) return true
  return false
}

export async function unmuteUser(guildId, userId) {
  await UserMuteModel.deleteMany({ guildId, userId })
  updateMutedUsers()
  return true
}

export async function getMutedList() {
  const resp = await UserMuteModel.find()
  return resp
}
