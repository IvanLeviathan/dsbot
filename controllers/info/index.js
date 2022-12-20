import UserInfoModel from '../../models/user_info/index.js'

export const getUserInfo = async (guildId, userId) => {
  const info = await UserInfoModel.findOne({ guildId, userId })

  if (!!info) return info
  return false
}

export const createOrUpdateInfo = async (guildId, userId, data) => {
  const info = await UserInfoModel.findOne({ guildId, userId })

  let res

  if (!!info) {
    info.text = data.text
    info.image = data.image
    res = await info.save()
  } else {
    const newInfo = new UserInfoModel({
      guildId,
      userId,
      text: data.text,
      image: data.image,
    })
    res = await newInfo.save()
  }

  if (!!res) return res
  return false
}
