import axios from 'axios'
import { client } from '../bot/index.js'
import {
  createOrUpdateSettings,
  getServerSettingsDB,
} from '../../controllers/settings/index.js'
import {
  declOfNum,
  getUserById,
  isUserHavePermissionsOnServer,
} from '../bot/helpers.js'
import {
  createOrUpdateInfo,
  getUserInfo,
} from '../../controllers/info/index.js'
import { addLog, getServerLogs } from '../../controllers/server_logs/index.js'
import {
  addMoney,
  addUserEarnedToday,
  checkIfUserEarnCreditstoday,
  getUserData,
} from '../../controllers/user_data/index.js'
import { getServerStatsDB } from '../../controllers/stats/index.js'

export const DS_API_ENDPOINT = 'https://discord.com/api/v8'
export const DS_CLIENT = '873224328701947924'
export const DS_SECRET = 'JWFNRr9nK2daP6yFYDgyJ0mlhv_fPWHz'

export const checkAuthCode = async (code, redirectUri) => {
  const params = new URLSearchParams()
  params.append('client_id', DS_CLIENT)
  params.append('client_secret', DS_SECRET)
  params.append('grant_type', 'authorization_code')
  params.append('code', code)
  params.append('redirect_uri', redirectUri)
  // console.log(params)
  const res = await axios
    .post(DS_API_ENDPOINT + '/oauth2/token?', params)
    .then((res) => {
      return res.data
    })
    .catch((e) => {
      console.log('AUTH_CHECK_CODE_ERROR', e)
      if (e.response?.data?.error)
        return { error: true, text: e.response.data.error_description }
    })
  return res
}

export const apiAuth = async (authToken) => {
  const headers = {
    Authorization: `Bearer ${authToken}`,
  }

  const res = await axios
    .get(DS_API_ENDPOINT + '/users/@me', {
      headers,
    })
    .then((res) => {
      return res.data
    })
    .catch((e) => {
      if (e.response.data.code === 0)
        return {
          error: true,
          text: e.response.data.message,
          status: e.response.status,
        }
      return {
        error: true,
        text: 'Не авторизован',
        status: 401,
      }
    })

  return res
}

export const getUser = async (authToken) => {
  const headers = {
    Authorization: `Bearer ${authToken}`,
  }
  const res = await axios
    .get(DS_API_ENDPOINT + '/users/@me', {
      headers,
    })
    .then((res) => {
      if (res.data.avatar)
        res.data.avatar = `https://cdn.discordapp.com/avatars/${res.data.id}/${res.data.avatar}.png`
      return res.data
    })
    .catch((e) => {
      if (e.response.data.code === 0)
        return { error: true, text: e.response.data.message }
    })
  return res
}

export const getAllBotsServers = async () => {
  let allGuilds = {}
  if (!!client) {
    await client.guilds.cache.map(guild => {
      allGuilds[guild.id] = true
    });
    // await client.guilds.fetch().then((guilds) => {
    //   guilds.forEach((guild) => {
    //     allGuilds[guild.id] = true
    //   })
    // })
  }
  return allGuilds
}

export const getUserGuilds = async (authToken) => {
  const headers = {
    Authorization: `Bearer ${authToken}`,
  }
  const fetchRes = await axios
    .get(DS_API_ENDPOINT + '/users/@me/guilds', {
      headers,
    })
    .then((res) => {
      return res.data
    })
    .catch((e) => {
      if (e.response.data.code === 0)
        return { error: true, text: e.response.data.message }
    })
  return fetchRes
}

export const getServerSettings = async (serverId, user) => {
  if (!serverId) return {}
  let settings = await getServerSettingsDB(serverId)
  const isUserAdmin = await isUserHavePermissionsOnServer(user.id, serverId, [
    'ADMINISTRATOR',
  ])
  settings = { ...settings._doc }
  settings.isAdmin = isUserAdmin
  return settings || {}
}

export const getServerStats = async (serverId) => {
  if (!serverId) return {}
  const stats = await getServerStatsDB(serverId)
  return stats || {}
}

export const getGuildChannels = async (serverId) => {
  if (!serverId) return {}
  const answer = await client.guilds
    .fetch(serverId)
    .then((guild) => {
      const channels = guild.channels.cache
      let dbChannels = {}
      channels.forEach((channel) => {
        dbChannels[channel.id] = {
          name: channel.name,
          type: channel.type,
        }
      })
      return dbChannels
    })
    .catch((e) => {
      return { error: true, text: e.toString() }
    })

  return answer
}

export const updateGuildSettings = async (serverId, newSettings, user) => {
  const newSettingsObj = JSON.parse(newSettings)
  if (!serverId) return { error: true, text: 'Не указан ID сервера' }

  const userCanChange = await isUserHavePermissionsOnServer(user.id, serverId, [
    'ADMINISTRATOR',
  ])
  if (!userCanChange)
    return { error: true, text: 'Недостаточно прав для изменения' }

  const res = await createOrUpdateSettings(serverId, newSettingsObj)
  if (!!res) {
    addLog(serverId, user.id, 'Обновление настроек', 'UPDATE_SETTINGS')
    return { success: true, text: 'Настройки успешно сохранены' }
  } else return { error: true, text: 'Ошибка сохранения настроек' }
}

export const getGuildUsers = async (serverId) => {
  if (!serverId) return { error: true, text: 'Не указан ID сервера' }

  const answer = await client.guilds
    .fetch(serverId)
    .then(async (guild) => {
      const answer = await guild.members
        .fetch()
        .then((members) => {
          let usersArr = []
          members.forEach((member) => {
            usersArr.push({
              nickname: member.nickname,
              username: member.user.username,
              bot: member.user.bot,
              discriminator: member.user.discriminator,
              avatar: member.user.avatar
                ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
                : null,
              id: member.user.id,
            })
          })
          return usersArr
        })
        .catch((error) => {
          return { error: true, text: error.tiString() }
        })

      return answer
    })
    .catch((e) => {
      return { error: true, text: e.toString() }
    })

  return answer
}

export const getUserPortfolio = async (serverId, userId, user) => {
  let portfolio = {}
  let infoDb = await getUserInfo(serverId, userId)
  infoDb = { ...infoDb._doc }
  const isUserAdmin = await isUserHavePermissionsOnServer(user.id, serverId, [
    'ADMINISTRATOR',
  ])
  if (!!infoDb) {
    infoDb.isAdmin = isUserAdmin
    return infoDb
  } else {
    portfolio.isAdmin = isUserAdmin
  }

  return portfolio
}

export const updateUserPortfolio = async (
  serverId,
  userId,
  newPortfolio,
  user,
) => {
  const newPortfolioObj = JSON.parse(newPortfolio)
  if (!newPortfolioObj)
    return { error: true, text: 'Некорректные данные нового портфолио' }
  if (!serverId) return { error: true, text: 'Не указан ID сервера' }
  if (!userId) return { error: true, text: 'Не указан ID пользователя' }

  const userCanChange = await isUserHavePermissionsOnServer(user.id, serverId, [
    'ADMINISTRATOR',
  ])
  if (!userCanChange)
    return { error: true, text: 'Недостаточно прав для изменения' }

  const resp = await createOrUpdateInfo(serverId, userId, newPortfolioObj)
  if (!!resp) {
    const user = await getUserById(userId)
    let logText = 'Обновление информации о пользователе'
    if (user) logText += ` ${user.username}#${user.discriminator}`
    else logText += ` ${userId}`
    addLog(serverId, user.id, logText, 'UPDATE_USER')
    return { success: true, text: 'Профиль успешно обновлен' }
  }

  return { error: true, text: 'Ошибка при сохранении профиля' }
}

export const getServerLogsAPI = async (serverId, user) => {
  let logs = await getServerLogs(serverId)
  const knownUsers = {}
  logs = await Promise.all(
    logs.map(async (log) => {
      if (!knownUsers[log.userId])
        knownUsers[log.userId] = await getUserById(log.userId)
      log.username = `${knownUsers[log.userId]?.username}#${
        knownUsers[log.userId]?.discriminator
      }`
      return log
    }),
  )
  return { success: true, data: logs }
}

export const getUserDataAPI = async (userId, user) => {
  let data = await getUserData(userId)
  if (!data) data = {}
  return { success: true, data: data }
}

export const earnCreditsAPI = async (userId, user) => {
  //need to check if user already got credits for today
  const userEarnedToday = await checkIfUserEarnCreditstoday(userId)
  if (!!userEarnedToday)
    return {
      error: true,
      text: 'Сегодня вы уже получили кредиты, приходите завтра.',
    }

  const randomInt = Math.floor(Math.random() * Math.floor(10)) + 1
  const res = await addMoney(userId, randomInt)

  if (!res) return { error: true, text: 'Ошибка начисления кредитов' }
  else {
    await addUserEarnedToday(userId)
    return {
      success: true,
      text: `${declOfNum(randomInt, [
        'Начислен',
        'Начислено',
        'Начислено',
      ])} ${randomInt} ${declOfNum(randomInt, [
        'кредит',
        'кредита',
        'кредитов',
      ])}`,
    }
  }
}
