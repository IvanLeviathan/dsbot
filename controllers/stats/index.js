import ServerStatsModel from '../../models/server_stats/index.js'

export async function saveStat(guildId, players, date) {
  const serverStats = await ServerStatsModel.findOne({ guildId })

  let statsObj = {}
  let res

  if (!!serverStats) {
    statsObj = serverStats.stats
    statsObj[date] = players
    res = await ServerStatsModel.updateOne(
      {
        guildId: guildId,
      },
      {
        stats: statsObj,
      },
    )
  } else {
    statsObj[date] = players
    const newStats = new ServerStatsModel({
      guildId,
      stats: statsObj,
    })
    res = await newStats.save()
  }

  return res
}

export async function getStats() {
  const resp = await ServerStatsModel.find()
  return resp
}

export const getServerStatsDB = async (guildId = false) => {
  if (!guildId) return false
  const guildStats = await ServerStatsModel.findOne({ guildId })
  if (!guildStats) return false
  if (!guildStats.stats) return false
  return guildStats.stats
}

export const deleteServerStats = async (guildId) => {
  const res = await ServerStatsModel.findOneAndDelete({ guildId })
}
