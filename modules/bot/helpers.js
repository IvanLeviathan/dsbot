import Discord from 'discord.js'
import fs from 'fs'
import util from 'util'
const readdir = util.promisify(fs.readdir)
import Gamedig from 'gamedig'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { legionsSettingsFromDb } from './data.js'
import { client } from './index.js'

export const embedMaxLength = 600

export const loadBotSlashCommands = async (client) => {
  let files = await readdir('./modules/bot/commands')

  let jsfile = files.filter((f) => f.split('.').pop() === 'js')

  if (jsfile.length <= 0) return console.log('Commands not found')
  console.log(`Founded ${jsfile.length} commands`)

  await Promise.all(
    jsfile.map(async (f) => {
      await import(`./commands/${f}`).then((expCom) => {
        client.commands.set(expCom.module.name, {
          description: expCom.module.description,
          options: expCom.module.options,
          function: expCom.module.function,
        })
        console.log(`Command ${expCom.module.name} loaded`)
      })
    }),
  )
  console.log(`======================`)
}

export const applyBotSlashCommands = async (client) => {
  const commands = client.application?.commands
  const loadedCommands = client.commands

  loadedCommands.forEach((commandObj, commandName) => {
    commands?.create({
      name: commandName,
      description: commandObj.description,
      options: commandObj.options,
    })
  })
  console.log(`Commands applied to bot`)
  console.log(`======================`)
}

export const declOfNum = (number, titles) => {
  const cases = [2, 0, 1, 1, 1, 2]
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ]
}

export const makeEmbed = (
  text,
  interaction = false,
  serverSettings = false,
  codeBlock = true,
  options = {},
) => {
  if (!!text && codeBlock) text = '```' + text + '```'
  let embed = new Discord.MessageEmbed()
  embed.setColor('#00FF00')
  embed.setDescription(text)
  if (!options.noAuthor) {
    embed.setAuthor({
      name: 'Смотрящий',
      iconURL:
        'https://cdn.discordapp.com/attachments/802269748414382110/802560698852048896/207435-200.png',
    })
  }
  if (!options.noFooter) {
    embed.setTimestamp()
  }

  if (!!interaction || !!serverSettings) {
    const curServerSettings = !!interaction
      ? legionsSettingsFromDb[interaction.guild.id]
      : serverSettings
    if (!!curServerSettings) {
      if (!!curServerSettings.botColor)
        embed.setColor(curServerSettings.botColor)
      embed.setDescription(text)
      if (!options.noAuthor) {
        embed.setAuthor({
          name: curServerSettings.botTitle,
          iconURL: curServerSettings.botThumb,
        })
      }
      if (!options.noFooter) {
        embed.setTimestamp()
        embed.setFooter(curServerSettings.botFooter)
      }
    }
  }
  return embed
}

export const getServerInfo = async (ip, port) => {
  // console.log(ip, port)
  let answer = null
  await Gamedig.query({
    type: 'arma3',
    host: ip,
    port: port,
    socketTimeout: 3000,
  })
    .then((state) => {
      answer.from = 'Query'
      answer = state
    })
    .catch(async (error) => {
      // console.log(error)
      answer = false
    })
  return answer
}

export const getServerInfoFromBattlemetrics = async (url) => {
  // API try, maybe later. Stuck how to get ALL PLAYERS now on server
  // const re = /\/(\d+)$/i
  // const found = url.match(re)
  // let bmServerId = null
  // if (!found[1]) return false
  // else bmServerId = found[1]

  // const now = new Date()
  // const nowMinusMinutes = new Date()
  // nowMinusMinutes.setMinutes(now.getMinutes() - 5);
  // const answer = {
  //   players: [],
  // }

  // const headers = {
  //   Authorization: `Bearer ${process.env.BATTLEMETRICS_TOKEN}`,
  // }
  // let fetchRes = await axios
  //   .get(`https://api.battlemetrics.com/servers/${bmServerId}`, {
  //     headers,
  //   })
  //   .then((res) => {
  //     return res.data.data.attributes
  //   })
  //   .catch((e) => {
  //     console.log(e)
  //     return false
  //   })

  // if (!!fetchRes) {
  //   answer.name = fetchRes.name
  //   answer.playersCount = `${fetchRes.players}/${fetchRes.maxPlayers}`
  //   answer.map = fetchRes.details?.map
  //   answer.connect = `${fetchRes.ip}:${fetchRes.port}`

  //   fetchRes = await axios
  //     .get(
  //       `https://api.battlemetrics.com/servers/${bmServerId}/relationships/sessions?at=${nowMinusMinutes.toISOString()}`,
  //       {
  //         headers,
  //       },
  //     )
  //     .then((res) => {
  //       if (!!res.data?.data) {
  //         res.data.data.forEach((elem) => {
  //           // console.log(elem)
  //           answer.players.push({
  //             name: elem.attributes?.name,
  //             time: '05:05',
  //           })
  //         })
  //       }
  //       return res
  //     })
  //     .catch((e) => {
  //       console.log(e)
  //       return false
  //     })

  //   return answer
  // } else {
  //   return false
  // }

  const response = await axios.get(url).catch((e) => {})
  if (!!response?.data) {
    const answer = {
      players: [],
    }
    try {
      const $ = cheerio.load(response.data)
      const trs = $('table.css-1y3vvw9 tbody').find('tr')
      trs.each((idx, elem) => {
        let playerName = $(elem.children[0].children).text()
        let playerTime = $(elem.children[1].children).text()
        answer.players.push({
          name: playerName,
          time: playerTime,
        })
      })
      answer.name = $('h2.css-u0fcdd').contents().first().text()

      let $serverInfo = $('div.server-info')
      let $upper = $serverInfo.children('.css-1i1egz4')
      let $dd = $upper.find('dd')
      let $lower = $serverInfo.children('div').find('dl:first-child')
      $dd.each((idx, elem) => {
        // console.log(idx, $(elem).text());
        if (idx === 1) answer.playersCount = $(elem).text()
        if (idx === 2) {
          let $span = $(elem).find('span:first-child')
          answer.connect = $span.text()
        }
      })
      answer.map = $lower.children('dd').first().text()
    } catch (e) {
      console.log(e)
    }

    answer.from = 'Battlemetrics'
    return answer
  } else return false
}

export const cutPlayersByEmbedSegments = (players = []) => {
  let curSegment = 0
  let playersListArr = []

  for (let key in players) {
    const curPlayer = players[key]
    if (typeof playersListArr[curSegment] == 'undefined')
      playersListArr[curSegment] = ''

    playersListArr[curSegment] =
      playersListArr[curSegment] + `${curPlayer.name} - ${curPlayer.time}\n`

    if (playersListArr[curSegment].length >= embedMaxLength) curSegment++
  }

  if (!playersListArr.length) playersListArr.push('Данные отсутствуют')

  return playersListArr
}

export const makeOnlineEmbed = (embed, serverData) => {
  embed.addField('Карта:', `\`\`\`${serverData.map}\`\`\``, true)
  embed.addField('Адрес:', `\`\`\`${serverData.connect}\`\`\``, true)
  embed.addField('Всего:', `\`\`\`${serverData.playersCount}\`\`\``, true)
  embed.addField('Название:', `\`\`\`${serverData.name}\`\`\``, false)
  embed.addField(
    'Быстрое подключение',
    `[steam://connect/${serverData.connect}](steam://connect/${serverData.connect})`,
  )
  if (!!serverData.from)
    embed.addField('Данные взяты из:', '```' + serverData.from + '```')
  const playersSegments = cutPlayersByEmbedSegments(serverData.players)
  playersSegments.forEach((elem, i) => {
    if (i === 0) embed.addField('Список:', '```' + elem + '```', false)
    else embed.addField('\u200b', '```' + elem + '```', false)
  })
  embed.addField('Помочь с оплатой VDS', 'https://boosty.to/heshjunior')
}

export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const filterPlayersByPartOfName = (players, parts) => {
  if (parts === 'none' || !parts) return players

  let neededPlayers = []
  parts.split(',').forEach((part) => {
    players.forEach((player, i) => {
      let re = new RegExp('(' + escapeRegExp(part) + ')(nd|th|st)?')
      if (!!player.name) {
        if (!!player.name.match(re)) {
          neededPlayers.push(player)
        }
      }
    })
  })
  return neededPlayers
}

export const padTo2Digits = (num) => {
  return num.toString().padStart(2, '0')
}

export const prettifyGamedigAnswer = (serverData) => {
  serverData.playersCount = `${serverData.raw.numplayers}/${serverData.maxplayers}`
  let players = []
  serverData.players.forEach((player, i) => {
    const playerTimeDate = new Date(player.raw.time * 1000)
    let playerTimeHours = playerTimeDate.getHours()
    let playerTimeMinutes = playerTimeDate.getMinutes()
    let playerTimeSeconds = playerTimeDate.getSeconds()
    if (playerTimeHours)
      playerTimeMinutes = playerTimeMinutes + playerTimeHours * 60

    players.push({
      name: player.name,
      time: `${padTo2Digits(playerTimeMinutes)}:${padTo2Digits(
        playerTimeSeconds,
      )}`,
    })
  })
  if (players.length) serverData.players = players
  return serverData
}

export const isImage = (url) => {
  return /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url)
}

export const isVideo = (url) => {
  return /\.(mp4|avi|mpeg|webm|mkv|flv|wmv|3gp)$/.test(url)
}

export const getGifFromTenor = async (url) => {
  const response = await axios.get(url).catch((e) => console.log(e))
  if (!!response?.data) {
    const $ = cheerio.load(response.data)
    const gif = $('div#single-gif-container img')

    const imageUrl = $(gif).attr('src')
    if (imageUrl) return imageUrl
  }

  return false
}

export const updateBotStatus = async (client) => {
  // const guilds = await client.guilds.fetch()
  const guilds = await client.guilds.cache.map((guild) => guild.id)
  const size = guilds.length
  // const { size } = guilds
  let allBotUsers = []

  // await Promise.all(
  //   guilds.map(async (guild) => {
  //     console.log(guild.id)
  //     const thisGuild = await client.guilds.fetch(guild.id).catch((e) => console.log(e))
  //     const users = await thisGuild.members.cache
  //     // console.log(users)
  //     users.map(async (user) => {
  //       const isBot = user.user.bot
  //       const id = user.user.id
  //       console.log(isBot, id)
  //       if (!isBot) allBotUsers.push(id)
  //     })
  //   }),
  // )
  // console.log(allBotUsers.length)
  // allBotUsers = [...new Set(allBotUsers)]
  // console.log(allBotUsers.length)

  client.user.setActivity(`servers: ${size}`, {
    type: 'WATCHING',
  })
}

export const updateBotNamesOnServers = async (client) => {
  const guilds = await client.guilds.fetch().catch((e) => console.log(e))
  await Promise.all(
    guilds.map(async (guild) => {
      const thisGuild = await client.guilds
        .fetch(guild.id)
        .catch((e) => console.log(e))
      const botUser = await thisGuild.members.fetch(client.user.id)
      const serverSettings = legionsSettingsFromDb[guild.id]
      if (serverSettings?.botTitle)
        await botUser.setNickname(serverSettings.botTitle)
    }),
  )
}

export const isUserHavePermissions = async (
  user,
  permissions = ['ADMINISTRATOR'],
) => {
  let have = false
  await Promise.all(
    permissions.map(async (perm) => {
      const checkPerm = await user.permissions.has(perm)
      if (checkPerm && !have) have = true
    }),
  )
  return have
}

export const isUserHavePermissionsOnServer = async (
  userId,
  serverId,
  permissions = ['ADMINISTRATOR'],
) => {
  if (!serverId) return false
  if (!userId) return false

  // userId = '402872883371573248'
  // serverId = '802597751149559840'

  let have = false
  const guild = await client.guilds.fetch(serverId).catch((e) => console.log(e))
  if (!guild) return have

  const user = await guild.members.fetch(userId).catch((e) => console.log(e))
  if (!!user) {
    await Promise.all(
      permissions.map(async (perm) => {
        const checkPerm = await user.permissions.has(perm)
        if (checkPerm && !have) have = true
      }),
    )
  }

  return have
}

export const filterStatsForServer = async (stats, guildId, date = false) => {
  let filteredStats = []

  let curServerStats = stats.filter((stat) => {
    return stat.guildId == guildId
  })

  if (!curServerStats.length) return filteredStats

  curServerStats = curServerStats[0].stats

  for (let statDate in curServerStats) {
    let curDateStats = curServerStats[statDate]
    let statDateObj = new Date(statDate)
    if (!!date) {
      if (
        date.getDay() !== statDateObj.getDay() ||
        date.getMonth() !== statDateObj.getMonth() ||
        date.getFullYear() !== statDateObj.getFullYear()
      )
        continue
    }
    curDateStats.forEach((curDateStat) => {
      filteredStats.push(curDateStat)
    })
  }

  return filteredStats
}

export const cutArrayToEmbedBlocksSegments = (array) => {
  let curSegment = 0
  let segments = []

  array.forEach((elem) => {
    if (typeof segments[curSegment] == 'undefined') segments[curSegment] = ''

    segments[curSegment] = segments[curSegment] + `${elem}\n`

    if (segments[curSegment].length >= embedMaxLength) curSegment++
  })

  if (!segments.length) segments.push('Данные отсутствуют')

  return segments
}

export const getRandomGifFromTenor = async (url) => {
  const response = await axios.get(url).catch((e) => console.log(e))
  if (!!response?.data) {
    const $ = cheerio.load(response.data)
    const gifs = $('div.GifList figure')

    const randomGifNumber = Math.floor(Math.random() * Math.floor(49))
    const randomGif = gifs[`${randomGifNumber}`]

    // console.log(randomGif)
    const gifImage = $(randomGif.children[0].children[0].children).attr('src')
    if (!!gifImage && gifImage.startsWith('http')) return gifImage
  }
  return false
}

export const sendMessageToChannel = async (channel, content) => {
  await channel.send(content).catch((e) => console.log(e))
}

export const getUserById = async (userId) => {
  return await client.users.fetch(userId).catch(console.error)
}
