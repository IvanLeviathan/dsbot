import ServerSettingsModel from '../../models/server_settings/index.js'
import { legionsSettingsFromDb } from '../../modules/bot/data.js'
import { deleteServerStats } from '../stats/index.js'

export const getServerSettingsDB = async (guildId = false) => {
  if (!guildId) return {}
  const res = await ServerSettingsModel.findOne({ guildId })
  if (!!res) return res
  return {}
}

export const createOrUpdateSettings = async (serverId, settings) => {
  // console.log(settings)
  let data = {}

  if (!!serverId) data.guildId = serverId
  else return false

  if (!!settings.botChannelId) data.botChannelId = settings.botChannelId
  if (!!settings.botColor) data.botColor = settings.botColor
  if (!!settings.botFooter) data.botFooter = settings.botFooter
  if (!!settings.botLegion) data.botLegion = settings.botLegion
  if (!!settings.botLegionServerIP)
    data.botLegionServerIP = settings.botLegionServerIP
  if (!!settings.botLegionServerPort)
    data.botLegionServerPort = settings.botLegionServerPort
  if (!!settings.botLegionsChannelId)
    data.botLegionsChannelId = settings.botLegionsChannelId
  if (!!settings.botThumb) data.botThumb = settings.botThumb
  if (!!settings.botTitle) data.botTitle = settings.botTitle
  if (!!settings.battleMetricsUrl)
    data.battleMetricsUrl = settings.battleMetricsUrl

  data.greetingsChannel = settings.greetingsChannel
  data.greetingsText = settings.greetingsText
  data.greetingsImage = settings.greetingsImage

  const serverSettings = await ServerSettingsModel.findOne({
    guildId: serverId,
  })

  let res

  if (!!serverSettings) {
    res = await ServerSettingsModel.updateOne({ guildId: serverId }, data)
  } else {
    const newModel = new ServerSettingsModel(data)
    res = await newModel.save()
  }

  if (!!res) return res
  return false
}

export const deleteServerSettings = async (guildId) => {
  const res = await ServerSettingsModel.findOneAndDelete({ guildId })
}

export const cleanServerSettings = async (client) => {
  const guilds = await client.guilds.fetch()
  const serversWhereBotIs = []
  guilds.forEach((guild) => {
    serversWhereBotIs.push(guild.id)
  })
  for (let guildId in legionsSettingsFromDb) {
    const curGuildSettings = legionsSettingsFromDb[guildId]
    if (!serversWhereBotIs.includes(curGuildSettings.guildId)) {
      deleteServerSettings(curGuildSettings.guildId)
      deleteServerStats(curGuildSettings.guildId)
    }
  }
}
