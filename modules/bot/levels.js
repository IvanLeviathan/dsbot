import { updateLevels } from '../../controllers/levels/index.js'
import { isServerBlackListed, isUserBlackListed } from './blacklist.js'
import { legionsSettingsFromDb } from './data.js'
import { makeEmbed, sendMessageToChannel } from './helpers.js'
import { client } from './index.js'
import { isUserMuted } from './mute.js'

function progress(a, d, messagesCount) {
  let summ = a
  let iter = 0
  while (summ < messagesCount) {
    summ = summ * d
    iter++
  }
  return iter
}

export const calcUserLevel = (messagesCount) => {
  const a = 8
  const d = 2
  const level = progress(a, d, messagesCount)
  return level
}

export const notifyLevelUp = async (guildId, userId, newLevel) => {
  const curServerSettings = legionsSettingsFromDb[guildId]
  if (!curServerSettings) return
  const channelId = curServerSettings.botChannelId
  if (!channelId) return

  const guild = await client.guilds.fetch(guildId)
  const user = await guild.members.fetch(userId)
  const name = user.nickname ? user.nickname : user.user.username

  const channel = await client.channels
    .fetch(channelId)
    .catch((e) => console.log(e))
  if (!channel) return

  const messageContent = {
    embeds: [
      makeEmbed(
        `glsl\n# ${name}\nновый уровень - ${newLevel}`,
        false,
        curServerSettings,
        true,
        {
          noFooter: true,
          noAuthor: true,
        },
      ),
    ],
  }
  await sendMessageToChannel(channel, messageContent)
}

export default async function levels(client, Discord) {
  let counter = {}
  client.on('message', async function (message) {
    if (message.channel.type === 'DM') return
    let guildId = message.guild?.id
    let userId = message.author.id

    if (message.author.bot) return

    //check for blacklist
    const userBlackListed = await isUserBlackListed(message.member.id)
    const serverBlackListed = await isServerBlackListed(message.guild.id)
    if (userBlackListed || serverBlackListed) return

    const isMuted = await isUserMuted(message.guild.id, message.member.id)
    if (isMuted) return

    if (!counter[guildId]) counter[guildId] = {}
    if (!counter[guildId][userId]) counter[guildId][userId] = 1
    else counter[guildId][userId]++
  })

  setInterval(() => {
    counter = updateLevels(counter)
  }, 360000)
}
