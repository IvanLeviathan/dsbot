import { getMutedList, unmuteUser } from '../../controllers/mute/index.js'
import { sendMessageToChannel } from './helpers.js'
import { client } from './index.js'

export let mutedUsers = {}

export async function updateMutedUsers() {
  const mutedList = await getMutedList()
  mutedUsers = {}
  mutedList.map((elem) => {
    const guildId = elem.guildId
    const userId = elem.userId
    if (!mutedUsers[guildId]) mutedUsers[guildId] = []

    mutedUsers[guildId].push(userId)
  })
}

export async function sendMutedUserANotif(userId, guildId = false) {
  const user = await client.users.fetch(userId)
  let message = 'Вы замучены на сервере'
  if (!!guildId) {
    const { name } = await client.guilds.fetch(guildId)
    message += ` **${name}**`
  }

  const messageContent = {
    content: message,
  }
  await sendMessageToChannel(user, messageContent)
}

export async function isUserMuted(guildId, userId) {
  if (!mutedUsers[guildId]) return false
  if (mutedUsers[guildId].includes(userId)) return true
  return false
}

export default async function mute(client, Discord) {
  await updateMutedUsers()
  client.on('ready', async () => {
    setInterval(async () => {
      //mute tick
      const mutedList = await getMutedList()
      await Promise.all(
        mutedList.map((elem) => {
          const minutes = elem.minutes
          const createdAt = elem.createdAt
          const nowDate = new Date()

          const diffMs = nowDate - createdAt
          const diffMins = Math.floor(diffMs / 60000)

          if (diffMins >= minutes) {
            unmuteUser(elem.guildId, elem.userId)
          }
        }),
      )
      await updateMutedUsers()
    }, 60000)
  })
  client.on('message', async (message) => {
    if (message.author.bot) return
    if (message.channel.type === 'DM') return

    const isMuted = await isUserMuted(message.guild?.id, message.member?.id)
    if (isMuted) {
      message
        .delete()
        .then(() => {
          sendMutedUserANotif(message.member.id, message.guild.id)
        })
        .catch((e) => console.log(e))
    }
  })
}
