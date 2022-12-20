import { getStats, saveStat } from '../../controllers/stats/index.js'
import { isServerBlackListed } from './blacklist.js'
import { legionsSettingsFromDb } from './data.js'
import {
  prettifyGamedigAnswer,
  getServerInfo,
  getServerInfoFromBattlemetrics,
  makeEmbed,
  makeOnlineEmbed,
  filterPlayersByPartOfName,
  filterStatsForServer,
  cutArrayToEmbedBlocksSegments,
  sendMessageToChannel,
} from './helpers.js'
import { client } from './index.js'

export const getAllOnlinesData = async (legionsSettingsFromDb) => {
  // first we need to get all ips:ports and battlemetrics urls
  let ips = []
  let bms = []
  for (let serverId in legionsSettingsFromDb) {
    const curServerLoop = legionsSettingsFromDb[serverId]
    ips.push(
      `${curServerLoop.botLegionServerIP}:${curServerLoop.botLegionServerPort}`,
    )
    if (curServerLoop.battleMetricsUrl) bms.push(curServerLoop.battleMetricsUrl)
  }
  ips = [...new Set(ips)]
  bms = [...new Set(bms)]

  // next step is to get all data from IPS and BM urls
  let ipsData = {}
  let bmsData = {}
  await Promise.all(
    ips.map(async (ip) => {
      const arr = ip.split(':')
      let serverData = await getServerInfo(arr[0], arr[1])
      if (!!serverData) {
        serverData = prettifyGamedigAnswer(serverData)
        ipsData[ip] = serverData
      }
    }),
  )
  await Promise.all(
    bms.map(async (bm) => {
      let serverData = await getServerInfoFromBattlemetrics(bm)
      if (!!serverData) {
        bmsData[bm] = serverData
      }
    }),
  )

  return {
    ipsData,
    bmsData,
  }
}

export const findDataAndSendOnlines = async (serverId, ipsData, bmsData) => {
  const curServerLoop = legionsSettingsFromDb[serverId]
  if (!curServerLoop) return
  const serverBlackListed = await isServerBlackListed(serverId)
  if (serverBlackListed) return

  const ip = `${curServerLoop.botLegionServerIP}:${curServerLoop.botLegionServerPort}`
  const bm = curServerLoop.battleMetricsUrl

  const channel = await client.channels
    .fetch(curServerLoop.botChannelId)
    .catch((e) => console.log(e))
  if (!channel) return

  let serverData = ipsData[ip]
  if (!serverData) serverData = bmsData[bm]

  if (!serverData) {
    const messageContent = {
      embeds: [makeEmbed('Не удалось получить данные', false, curServerLoop)],
    }
    await sendMessageToChannel(channel, messageContent)
  } else {
    const curServerData = { ...serverData }

    curServerData.players = filterPlayersByPartOfName(
      curServerData.players,
      curServerLoop.botLegion,
    )
    const embed = makeEmbed(``, false, curServerLoop)
    makeOnlineEmbed(embed, curServerData)

    const messageContent = {
      embeds: [embed],
    }
    await sendMessageToChannel(channel, messageContent)
  }
}

export const sendOnlines = async () => {
  const { ipsData, bmsData } = await getAllOnlinesData(legionsSettingsFromDb)
  // console.log(bmsData)
  // last step is to loop throught the servers, fetch channels and send data to them
  for (let serverId in legionsSettingsFromDb) {
    findDataAndSendOnlines(serverId, ipsData, bmsData)
  }
}

export const saveStats = async (date) => {
  const { ipsData, bmsData } = await getAllOnlinesData(legionsSettingsFromDb)

  for (let serverId in legionsSettingsFromDb) {
    const curServerLoop = legionsSettingsFromDb[serverId]
    const ip = `${curServerLoop.botLegionServerIP}:${curServerLoop.botLegionServerPort}`
    const bm = curServerLoop.battleMetricsUrl

    const serverBlackListed = await isServerBlackListed(serverId)
    if (serverBlackListed) continue

    let serverData = ipsData[ip]
    if (!serverData) serverData = bmsData[bm]

    if (!!serverData) {
      const curServerData = { ...serverData }

      curServerData.players = filterPlayersByPartOfName(
        curServerData.players,
        curServerLoop.botLegion,
      )

      await saveStat(serverId, curServerData.players, date)
    }
  }
}

export const filterAndSendStatDataToServer = async (
  curServerLoop,
  allStats,
) => {
  const serverStats = await filterStatsForServer(
    allStats,
    curServerLoop.guildId,
    new Date(),
  )
  const channel = await client.channels
    .fetch(curServerLoop.botChannelId)
    .catch((e) => console.log(e))
  if (!channel) return

  let usersStat = []
  await Promise.all(
    serverStats.map(async (serverStat) => {
      const name = await serverStat.name
      usersStat.push(name)
    }),
  )
  usersStat = [...new Set(usersStat)]
  const embed = makeEmbed(`Были сегодня:`, false, curServerLoop, false)

  const segments = cutArrayToEmbedBlocksSegments(usersStat)
  segments.forEach((segment) => {
    embed.addField('\u200b', '```' + segment + '```')
  })
  const messageContent = {
    embeds: [embed],
  }
  await sendMessageToChannel(channel, messageContent)
}

export const sendServerStats = async () => {
  const allStats = await getStats()
  for (let serverId in legionsSettingsFromDb) {
    const curServerLoop = legionsSettingsFromDb[serverId]
    const serverBlackListed = await isServerBlackListed(serverId)
    if (serverBlackListed) continue
    filterAndSendStatDataToServer(curServerLoop, allStats)
  }
}

export default function online(client, Discord) {
  client.on('ready', async () => {
    console.log('Online functions started')
    let dt, now
    setInterval(() => {
      now = new Date()
      dt = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
      dt.setUTCHours(dt.getUTCHours() + 3)
      // setted moscow time

      if (dt.getMinutes() == 0) {
        console.log(
          'Send onlines',
          dt.toLocaleDateString(),
          dt.toLocaleTimeString(),
        )
        sendOnlines()
      }
      if (dt.getMinutes() == 30) {
        console.log(
          'Save stats',
          dt.toLocaleDateString(),
          dt.toLocaleTimeString(),
        )
        saveStats(new Date())
      }

      if (dt.getMinutes() == 55 && dt.getHours() == 23) {
        sendServerStats()
      }
    }, 60000)
  })
}
