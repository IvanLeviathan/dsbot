import UserLevelModel from '../../models/levels/index.js'
import { calcUserLevel, notifyLevelUp } from '../../modules/bot/levels.js'

export async function getUserMessagesCount(serverId, userId) {
  const user = await UserLevelModel.findOne({
    guildId: serverId,
    userId,
  })
  if (!!user) return user.messagesCount
  return false
}

export async function getGuildMessages(guildId) {
  const guildMessages = await UserLevelModel.find({ guildId }).sort([
    ['messagesCount', 'DESC'],
  ])
  return guildMessages
}

export async function updateLevels(counter) {
  if (Object.keys(counter).length === 0) return counter

  const levels = await UserLevelModel.find()

  let levelsObj = {}

  levels.forEach((elem) => {
    if (!levelsObj[elem.guildId]) levelsObj[elem.guildId] = {}
    levelsObj[elem.guildId][elem.userId] = elem.messagesCount
  })

  for (let serverId in counter) {
    const curServerUsers = counter[serverId]
    for (let userId in curServerUsers) {
      const messagesCount = curServerUsers[userId]

      const existedUser = levelsObj?.[serverId]?.[userId]

      if (existedUser) {
        const dbMessagesCount = existedUser

        const newMessagesCount = dbMessagesCount + messagesCount
        const oldLevel = calcUserLevel(dbMessagesCount)
        const newLevel = calcUserLevel(newMessagesCount)

        const userLevel = await UserLevelModel.findOne({
          guildId: serverId,
          userId,
        })
        userLevel.messagesCount = newMessagesCount
        await userLevel.save()
        if (newLevel !== oldLevel) notifyLevelUp(serverId, userId, newLevel)
      } else {
        const newUserLevel = new UserLevelModel({
          guildId: serverId,
          userId,
          messagesCount,
        })
        await newUserLevel.save()
      }
    }
  }
  return {}
}
