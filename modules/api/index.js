import { getDataFromDb } from '../bot/data.js'
import {
  getUser,
  checkAuthCode,
  apiAuth,
  getAllBotsServers,
  getUserGuilds,
  getServerSettings,
  getServerStats,
  getGuildChannels,
  updateGuildSettings,
  getGuildUsers,
  getUserPortfolio,
  updateUserPortfolio,
  getServerLogsAPI,
  getUserDataAPI,
  earnCreditsAPI,
} from './functions.js'

const apiRequest = async (req) => {
  let answer = { error: true, text: 'Неизвестная ошибка' }
  if (req.action === 'CHECK_AUTH_CODE') {
    if (!req.code) return { error: true, text: 'Не указан код авторизации' }
    if (!req.redirect_uri)
      return { error: true, text: 'Не указана ссылка редиректа' }
    answer = await checkAuthCode(req.code, req.redirect_uri)
    return answer
  }

  if (!req.auth_token) return { error: true, text: 'Не авторизован' }
  if (!req.action) return { error: true, text: 'Не указано действие' }

  const user = await apiAuth(req.auth_token)
  if (user.error)
    return { error: true, text: 'Не авторизован', status: user.status }

  switch (req.action) {
    case 'GET_USER':
      answer = await getUser(req.auth_token)
      break
    case 'GET_ALL_SERVER_WHERE_BOT_IS':
      answer = await getAllBotsServers()
      break
    case 'GET_USER_GUILDS':
      answer = await getUserGuilds(req.auth_token)
      break
    case 'GET_SERVER_SETTINGS':
      if (!req.server_id || req.server_id == 'undefined')
        return { error: true, text: 'Не указан ID сервера' }
      answer = await getServerSettings(req.server_id, user)
      break
    case 'GET_SERVER_STATS':
      if (!req.server_id || req.server_id == 'undefined')
        return { error: true, text: 'Не указан ID сервера' }
      answer = await getServerStats(req.server_id)
      break
    case 'GET_GUILD_CHANNELS':
      if (!req.server_id || req.server_id == 'undefined')
        return { error: true, text: 'Не указан ID сервера' }
      answer = await getGuildChannels(req.server_id)
      break
    case 'UPDATE_GUILD_SETTINGS':
      if (!req.server_id) return { error: true, text: 'Не указан ID сервера' }
      if (!JSON.parse(req.new_settings))
        return { error: true, text: 'Некорректный объект новых настроек' }
      answer = await updateGuildSettings(req.server_id, req.new_settings, user)
      //update all data from db after we saved or not saved, doest matter
      await getDataFromDb()
      break
    case 'GET_GUILD_USERS':
      if (!req.server_id || req.server_id == 'undefined')
        return { error: true, text: 'Не указан ID сервера' }
      answer = await getGuildUsers(req.server_id)
      break
    case 'GET_USER_PORTFOLIO':
      if (!req.server_id || req.server_id == 'undefined')
        return { error: true, text: 'Не указан ID сервера' }
      if (!req.user_id || req.user_id == 'undefined')
        return { error: true, text: 'Не указан ID пользователя' }
      answer = await getUserPortfolio(req.server_id, req.user_id, user)
      break
    case 'UPDATE_USER_PORTFOLIO':
      if (!req.server_id || req.server_id == 'undefined')
        return { error: true, text: 'Не указан ID сервера' }
      if (!req.user_id || req.user_id == 'undefined')
        return { error: true, text: 'Не указан ID пользователя' }
      if (!JSON.parse(req.new_portfolio) || !req.new_portfolio)
        return { error: true, text: 'Не указаные новые данные портфолио' }
      answer = await updateUserPortfolio(
        req.server_id,
        req.user_id,
        req.new_portfolio,
        user,
      )
      break
    case 'GET_SERVER_LOGS':
      if (!req.server_id || req.server_id == 'undefined')
        return { error: true, text: 'Не указан ID сервера' }
      answer = await getServerLogsAPI(req.server_id, user)
      break
    case 'GET_USER_DATA':
      if (!req.user_id || req.user_id == 'undefined')
        return { error: true, text: 'Не указан ID пользователя' }
      answer = await getUserDataAPI(req.user_id, user)
      break
    case 'EARN_CREDITS':
      if (!req.user_id || req.user_id == 'undefined')
        return { error: true, text: 'Не указан ID пользователя' }
      answer = await earnCreditsAPI(req.user_id, user)
      break
    default:
      return { error: true, text: 'Неизвестное действие' }
  }

  return answer || { error: true, text: 'Неизвестная ошибка' }
}
export default apiRequest
