import ServerLogsModel from '../../models/server_logs/index.js'

export const addLog = async (guildId, userId, action, actionType) => {
  const existedServerLogs = await ServerLogsModel.findOne({ guildId })
  let logsObj = {
    userId,
    action,
    actionType,
    createdAt: new Date(),
  }

  let res = false
  if (!existedServerLogs) {
    const newLogs = new ServerLogsModel({
      guildId,
      logs: [logsObj],
    })
    res = await newLogs.save()
  } else {
    if (typeof existedServerLogs.logs == 'object') {
      const newLogs = [...existedServerLogs.logs]
      newLogs.unshift(logsObj)
      existedServerLogs.logs = newLogs
      res = await existedServerLogs.save()
    } else {
      res = false
    }
  }
  return !!res ? true : false
}

export const getServerLogs = async (guildId) => {
  let logsArr = []
  const res = await ServerLogsModel.findOne({ guildId })
  if (!!res) logsArr = res.logs
  return logsArr
}
