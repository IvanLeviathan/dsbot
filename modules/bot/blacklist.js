import BlackListModel from '../../models/blacklist/index.js'

export let blacklisted = {
  servers: [],
  users: [],
}

export const getBlacklist = async () => {
  let allUsers = []
  let allServers = []
  const resp = await BlackListModel.find()
  await Promise.all(
    resp.map(async (elem) => {
      const guildId = await elem.guildId
      const userId = await elem.userId
      if (!!guildId) allServers.push(guildId)
      if (!!userId) allUsers.push(userId)
    }),
  )

  allServers = [...new Set(allServers)]
  allUsers = [...new Set(allUsers)]

  blacklisted.servers = allServers
  blacklisted.users = allUsers
  console.log(
    `Blacklisted servers: ${blacklisted.servers.length}, users: ${blacklisted.users.length}`,
  )
  return blacklisted
}

export const isUserBlackListed = async (userId) => {
  return blacklisted.users.includes(userId)
}

export const isServerBlackListed = async (serverId) => {
  return blacklisted.servers.includes(serverId)
}

export default async function blacklist(client) {
  await getBlacklist()
}
