import UserDataModel from '../../models/user_data/index.js'

export const addMoney = async (userId, num) => {
  const userData = await UserDataModel.findOne({ userId })
  let res

  if (!!userData) {
    const moneyDb = userData.money || 0
    res = await UserDataModel.updateOne({ userId }, { money: moneyDb + num })
  } else {
    const newUserData = new UserDataModel({
      userId,
      money: num,
    })
    res = await newUserData.save()
  }
  if (!!res) return res
  return false
}

export const removeMoney = async (userId, num) => {}

export const getUserData = async (userId) => {
  const userData = await UserDataModel.findOne({ userId })
  if (!!userData) return userData
  else return false
}

export const addUserEarnedToday = async (userId) => {
  let res = await UserDataModel.updateOne({ userId }, { lastEarn: new Date() })
  return res
}

export const checkIfUserEarnCreditstoday = async (userId) => {
  const userData = await UserDataModel.findOne({ userId })
  const now = new Date()
  if (!userData) return false
  if (!userData.lastEarn) return false

  if (
    now.getDate() === userData.lastEarn.getDate() &&
    now.getMonth() === userData.lastEarn.getMonth() &&
    now.getFullYear() === userData.lastEarn.getFullYear()
  )
    return true
  else return false
}
